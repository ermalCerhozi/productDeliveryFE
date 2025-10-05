import {
    Component,
    inject,
    signal,
    computed,
    DestroyRef,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AsyncPipe, DatePipe } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { MatButton } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatDivider } from '@angular/material/divider'
import { MatIcon } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco'

import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { OrderEntity } from 'src/app/shared/models/order.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { UserEntity } from 'src/app/shared/models/user.model'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { AdvancedSelection } from 'src/app/shared/models/advanced-selection.model'
import { FiltersComponent } from '../../../../shared/components/filters/filters.component'
import { SimpleRadioSelectFilterComponent } from '../../../../shared/components/filters/simple-radio-select-filter/simple-radio-select-filter.component'
import { AdvancedTextFilterComponent } from '../../../../shared/components/filters/advanced-text-filter/advanced-text-filter.component'
import { FiltersResultComponent } from '../../../../shared/components/filters-panel/filters-result/filters-result.component'
import { TableComponent } from 'src/app/shared/components/table/table.component'
import { UserFiltersResponse } from 'src/app/shared/models/mediaLibraryResponse.model'

@Component({
    selector: 'app-orders-list',
    templateUrl: './orders-list.component.html',
    styleUrls: ['./orders-list.component.scss'],
    imports: [
        AsyncPipe,
        MatButton,
        MatIcon,
        FiltersComponent,
        SimpleRadioSelectFilterComponent,
        AdvancedTextFilterComponent,
        MatDivider,
        FiltersResultComponent,
        TableComponent,
        MatMenuModule,
        TranslocoDirective,
    ],
    providers: [DatePipe],
})
export class OrdersListComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);
    private bakeryManagementApiService = inject(BakeryManagementApiService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private translocoService = inject(TranslocoService);
    private datePipe = inject(DatePipe);
    public bakeryManagementService = inject(BakeryManagementService);

    // Date filters - converted to signals
    public defaultDateFilter: FilterOption = {
        value: 'any-time',
        label: 'TE_ORDER_DATE_ANY_TIME',
        isTranslated: true,
    };
    
    public orderDates = signal<FilterOption[]>([
        { value: 'any-time', label: 'Any time', isTranslated: true },
        { value: 'today', label: 'Today', isTranslated: true },
        { value: 'last-24h', label: 'Last 24h', isTranslated: true },
        { value: 'last-48h', label: 'Last 48h', isTranslated: true },
        { value: 'this-week', label: 'This week', isTranslated: true },
        { value: 'this-month', label: 'This month', isTranslated: true },
        { value: 'last-month', label: 'Last month', isTranslated: true },
        { value: 'last-6months', label: 'Last 6 months', isTranslated: true },
        { value: 'last-12months', label: 'Last 12 months', isTranslated: true },
    ]);
    
    public selectedDate = signal<FilterOption>(this.defaultDateFilter);

    // Client filters - converted to signals
    public clients = signal<FilterOption[]>([]);
    public selectedClients = signal<FilterOption[]>([]);
    public clientsLoading = signal<boolean>(false);
    public hasMoreClientsToLoad = signal<boolean>(true);
    public clientSearchQuery = '';

    // Seller filters - converted to signals
    public sellers = signal<FilterOption[]>([]);
    public selectedSellers = signal<FilterOption[]>([]);
    public sellersLoading = signal<boolean>(false);
    public hasMoreSellersToLoad = signal<boolean>(true);
    public sellerSearchQuery = '';

    // Computed filter results
    public filterResults = computed<FilterOption[]>(() => {
        const results: FilterOption[] = [];
        
        // Add date filter if not default
        if (this.selectedDate().value !== 'any-time') {
            results.push(this.selectedDate());
        }
        
        // Add selected clients
        results.push(...this.selectedClients());
        
        // Add selected sellers
        results.push(...this.selectedSellers());
        
        return results;
    });

    // Table state
    public tableColumns = signal([
        { key: "client", label: "ordersList.client" },
        { key: "order", label: "ordersList.order" },
        { key: "date", label: "ordersList.date" },
    ]);
    public tableData$!: Observable<any[]>;
    public totalCount = signal(0);
    public currentPage = signal(1);
    public pageSize = signal(10);
    private ordersMap = new Map<number, OrderEntity>();
    
    public activeOrder: OrderEntity | undefined;
    public loggedInUser!: UserEntity;
    public action = 'create';

    constructor() {
        // Initialize logged in user
        this.loggedInUser = JSON.parse(localStorage.getItem('currentUser') || '')
        
        // Load initial data
        this.findAll();
    }

    public findAll(): void {
        const pageSize = this.pageSize();
        const pageIndex = this.currentPage();

        // Build filters object using the helper method
        const filters = this.buildFiltersPayload();

        this.tableData$ = this.bakeryManagementApiService.searchOrders(
            pageIndex,
            pageSize,
            filters
        ).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(response => {
                this.totalCount.set(response.count);
                this.ordersMap.clear();
                return response.orders.map(order => {
                    this.ordersMap.set(order.id, order);
                    return {
                        id: order.id,
                        client: `${order.client.first_name} ${order.client.last_name}`,
                        order: order.order_items.map(item => 
                            `${item.quantity}${item.returned_quantity !== 0 ? ' - ' + item.returned_quantity : ''} ${item.product.product_name}`
                        ).join(', '),
                        date: this.datePipe.transform(order.created_at, 'dd/MM/yy HH:mm', undefined, 'en-GB') || ''
                    };
                });
            })
        );
    }

    public onPageInfoChange(pageInfo: { currentPage: number; pageSize: number }): void {
        this.currentPage.set(pageInfo.currentPage);
        this.pageSize.set(pageInfo.pageSize);
        this.findAll();
    }

    selectOrder(order: OrderEntity): void {
        this.activeOrder = order
    }

    public onEdit(order: any): void {
        this.activeOrder = this.ordersMap.get(order.id);
        if (this.activeOrder) {
            this.updateOrder();
        }
    }

    public onDelete(order: any): void {
        this.activeOrder = this.ordersMap.get(order.id);
        if (this.activeOrder) {
            this.deleteOrder();
        }
    }

    updateOrder(): void {
        this.action = 'update'
        this.router.navigate(['update'], {
            relativeTo: this.route,
            queryParams: { id: this.activeOrder!.id },
        })
    }

    createOrder(): void {
        this.action = 'create'
        this.router.navigate(['create'], { relativeTo: this.route })
    }

    // Filter methods
    onClientDropdownOpened(isOpen: boolean): void {
        if (isOpen && this.clients().length === 0) {
            this.getPaginatedClients();
        }
    }

    onSellerDropdownOpened(isOpen: boolean): void {
        if (isOpen && this.sellers().length === 0) {
            this.getPaginatedSellers();
        }
    }

    clientSearchChange(data: string): void {
        this.clientSearchQuery = data;
        this.clients.set([]);
        this.hasMoreClientsToLoad.set(true);
        this.getPaginatedClients();
    }

    loadMoreClients(): void {
        this.getPaginatedClients();
    }

    sellerSearchChange(data: string): void {
        this.sellerSearchQuery = data;
        this.sellers.set([]);
        this.hasMoreSellersToLoad.set(true);
        this.getPaginatedSellers();
    }

    loadMoreSellers(): void {
        this.getPaginatedSellers();
    }

    applyFilters(data: FilterOption | FilterOption[] | AdvancedSelection, filterType: string): void {
        switch (filterType) {
            case 'date':
                this.applyDateFilter(data as FilterOption);
                break;
            case 'client':
                this.applyClientFilters(data as AdvancedSelection);
                break;
            case 'seller':
                this.applySellerFilters(data as AdvancedSelection);
                break;
        }
    }

    removeFilter(data: FilterOption): void {
        if (data.value === this.selectedDate().value) {
            this.selectedDate.set(this.defaultDateFilter);
        } else {
            this.selectedClients.update(current =>
                current.filter(f => f.value !== data.value)
            );
            this.selectedSellers.update(current =>
                current.filter(f => f.value !== data.value)
            );
        }
        this.onApplyFilters();
    }

    clearFilters(): void {
        this.selectedClients.set([]);
        this.selectedSellers.set([]);
        this.selectedDate.set(this.defaultDateFilter);
        this.onApplyFilters();
    }

    deleteOrder(): void {
        if (!this.activeOrder) return;

        const formattedDate = this.datePipe.transform(this.activeOrder.created_at, 'dd/MM/yy HH:mm', undefined, 'en-GB') || '';

        this.dialog.open(ConfirmationDialogComponent, {
            width: '80%',
            maxHeight: '40%',
            data: {
                title: this.translocoService.translate('ordersList.deleteTitle'),
                message: this.translocoService.translate('ordersList.deleteMessage', { 
                    client: `${this.activeOrder.client.first_name}`,
                    date: formattedDate
                }),
                displayOkButton: true,
                displayCancelButton: true
            }
        }).afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.bakeryManagementApiService.deleteOrder(this.activeOrder!.id)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: () => {
                            this.snackBar.open(
                                this.translocoService.translate('ordersList.deleteSuccess'),
                                this.translocoService.translate('ordersList.deleteSuccess'),
                                {
                                    duration: 3000,
                                    horizontalPosition: 'end',
                                    verticalPosition: 'top',
                                    panelClass: ['snack-bar-success'],
                                }
                            )
                            this.findAll();
                            this.activeOrder = undefined;
                        },
                        error: (error) => {
                            const errorMessage = error?.error?.message || this.translocoService.translate('ordersList.deleteError')
                            this.snackBar.open(errorMessage, this.translocoService.translate('ordersList.deleteError'), {
                                duration: 5000,
                                horizontalPosition: 'end',
                                verticalPosition: 'top',
                                panelClass: ['snack-bar-error'],
                            })
                        }
                    });
            }
        });
    }

    downloadOrdersPdf() {
        const filters = this.buildFiltersPayload();
        this.bakeryManagementService.downloadOrdersPdf(filters)
    }

    downloadOrdersCsv() {
        const filters = this.buildFiltersPayload();
        this.bakeryManagementService.downloadOrdersCsv(filters)
    }

    private buildFiltersPayload(): any {
        const filters: any = {};
        
        if (this.selectedDate().value !== 'any-time') {
            filters.date = this.selectedDate().value;
        }
        
        if (this.selectedClients().length > 0) {
            filters.clientIds = this.selectedClients().map((c: FilterOption) => c.value);
        }
        
        if (this.selectedSellers().length > 0) {
            filters.sellerIds = this.selectedSellers().map((s: FilterOption) => s.value);
        }

        return filters;
    }

    // Private filter helper methods
    private applyDateFilter(data: FilterOption): void {
        this.selectedDate.set(data);
        this.onApplyFilters();
    }

    private applyClientFilters(data: AdvancedSelection): void {
        this.applyAdvancedFilters([data], this.selectedClients);
    }

    private applySellerFilters(data: AdvancedSelection): void {
        this.applyAdvancedFilters([data], this.selectedSellers);
    }

    private onApplyFilters(): void {
        this.currentPage.set(1);
        this.findAll();
    }

    private applyAdvancedFilters(
        selectedFilters: AdvancedSelection[],
        currentlySelectedFilters: ReturnType<typeof signal<FilterOption[]>>
    ): void {
        selectedFilters.forEach((selectedFilter: AdvancedSelection) => {
            if (selectedFilter.selected) {
                // Add filter if not already present
                const exists = currentlySelectedFilters().some(
                    f => f.value === selectedFilter.value.value
                );
                if (!exists) {
                    currentlySelectedFilters.update(current => [...current, selectedFilter.value]);
                }
            } else {
                // Remove filter
                currentlySelectedFilters.update(current =>
                    current.filter(f => f.value !== selectedFilter.value.value)
                );
            }
        });
        
        this.onApplyFilters();
    }

    private getPaginatedClients(): void {
        this.clientsLoading.set(true);
        const payload: any = {
            pagination: {
                offset: this.clients().length,
                limit: 5,
            },
        };
        if (this.clientSearchQuery) {
            payload.clientName = this.clientSearchQuery;
        }

        this.bakeryManagementApiService.getClientFiltersForOrder(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((clientList: UserFiltersResponse[]) => {
                this.hasMoreClientsToLoad.set(clientList.length !== 0);
                this.addClientsToSelectionList(clientList);
                this.clientsLoading.set(false);
            });
    }

    private getPaginatedSellers(): void {
        this.sellersLoading.set(true);
        const payload: any = {
            pagination: {
                offset: this.sellers().length,
                limit: 5,
            },
        };
        if (this.sellerSearchQuery) {
            payload.sellerName = this.sellerSearchQuery;
        }

        this.bakeryManagementApiService.getSellerFiltersForOrder(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((sellerList: UserFiltersResponse[]) => {
                this.hasMoreSellersToLoad.set(sellerList.length !== 0);
                this.addSellersToSelectionList(sellerList);
                this.sellersLoading.set(false);
            });
    }

    private addClientsToSelectionList(clientList: UserFiltersResponse[]): void {
        const newClients: FilterOption[] = clientList.map(client => ({
            value: client.id,
            label: `${client.first_name} ${client.last_name}`,
            count: client.mediaCount,
        }));
        this.clients.update(current => [...current, ...newClients]);
    }

    private addSellersToSelectionList(sellerList: UserFiltersResponse[]): void {
        const newSellers: FilterOption[] = sellerList.map(seller => ({
            value: seller.id,
            label: `${seller.first_name} ${seller.last_name}`,
            count: seller.mediaCount,
        }));
        this.sellers.update(current => [...current, ...newSellers]);
    }
}
