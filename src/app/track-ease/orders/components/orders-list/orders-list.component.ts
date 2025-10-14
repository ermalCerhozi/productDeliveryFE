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
        label: this.translocoService.translate('ordersList.orderDateAnyTime'),
        isTranslated: true,
    };
    
    public orderDates = signal<FilterOption[]>([
        { value: 'any-time', label: this.translocoService.translate('ordersList.orderDateAnyTime'), isTranslated: true },
        { value: 'today', label: this.translocoService.translate('ordersList.orderDateToday'), isTranslated: true },
        { value: 'last-24h', label: this.translocoService.translate('ordersList.orderDateLast24h'), isTranslated: true },
        { value: 'last-48h', label: this.translocoService.translate('ordersList.orderDateLast48h'), isTranslated: true },
        { value: 'this-week', label: this.translocoService.translate('ordersList.orderDateThisWeek'), isTranslated: true },
        { value: 'this-month', label: this.translocoService.translate('ordersList.orderDateThisMonth'), isTranslated: true },
        { value: 'last-month', label: this.translocoService.translate('ordersList.orderDateLastMonth'), isTranslated: true },
        { value: 'last-6months', label: this.translocoService.translate('ordersList.orderDateLast6Months'), isTranslated: true },
        { value: 'last-12months', label: this.translocoService.translate('ordersList.orderDateLast12Months'), isTranslated: true },
    ]);
    
    public selectedDate = signal<FilterOption>(this.defaultDateFilter);

    // Client filters - converted to signals
    public clients = signal<FilterOption[]>([]);
    public selectedClients = signal<FilterOption[]>([]);
    public clientsLoading = signal<boolean>(false);
    public hasMoreClientsToLoad = signal<boolean>(true);
    public clientSearchQuery = '';
    private pendingClientSelections: FilterOption[] = [];

    // Seller filters - converted to signals
    public sellers = signal<FilterOption[]>([]);
    public selectedSellers = signal<FilterOption[]>([]);
    public sellersLoading = signal<boolean>(false);
    public hasMoreSellersToLoad = signal<boolean>(true);
    public sellerSearchQuery = '';
    private pendingSellerSelections: FilterOption[] = [];

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
    public currentPage = signal(0);
    public pageSize = signal(10);
    private ordersMap = new Map<number, OrderEntity>();
    
    public activeOrder: OrderEntity | undefined;
    public loggedInUser!: UserEntity;
    public action = 'create';

    // Computed signals to check user role
    public isClient = computed(() => this.loggedInUser?.role === 'Client');
    public isSeller = computed(() => this.loggedInUser?.role === 'Seller');

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
        if (isOpen) {
            if (this.clients().length === 0) {
                this.getPaginatedClients();
            }
            // Initialize pending selections with current selections when opening
            this.pendingClientSelections = [...this.selectedClients()];
        } else {
            // Apply filters only when dropdown is closed
            this.applyPendingClientFilters();
        }
    }

    onSellerDropdownOpened(isOpen: boolean): void {
        if (isOpen) {
            if (this.sellers().length === 0) {
                this.getPaginatedSellers();
            }
            // Initialize pending selections with current selections when opening
            this.pendingSellerSelections = [...this.selectedSellers()];
        } else {
            // Apply filters only when dropdown is closed
            this.applyPendingSellerFilters();
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
                this.updatePendingClientFilters(data as AdvancedSelection);
                break;
            case 'seller':
                this.updatePendingSellerFilters(data as AdvancedSelection);
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
        const pageSize = this.pageSize();
        const pageIndex = this.currentPage();
        const filters = this.buildFiltersPayload();

        this.bakeryManagementService.downloadOrdersPdf(pageIndex, pageSize, filters);
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

    private updatePendingClientFilters(data: AdvancedSelection): void {
        if (data.selected) {
            // Add to pending if not already present
            const exists = this.pendingClientSelections.some(
                f => f.value === data.value.value
            );
            if (!exists) {
                this.pendingClientSelections.push(data.value);
            }
        } else {
            // Remove from pending
            this.pendingClientSelections = this.pendingClientSelections.filter(
                f => f.value !== data.value.value
            );
        }
    }

    private updatePendingSellerFilters(data: AdvancedSelection): void {
        if (data.selected) {
            // Add to pending if not already present
            const exists = this.pendingSellerSelections.some(
                f => f.value === data.value.value
            );
            if (!exists) {
                this.pendingSellerSelections.push(data.value);
            }
        } else {
            // Remove from pending
            this.pendingSellerSelections = this.pendingSellerSelections.filter(
                f => f.value !== data.value.value
            );
        }
    }

    private applyPendingClientFilters(): void {
        // Check if pending selections differ from current selections
        const hasChanges = this.hasSelectionChanges(
            this.pendingClientSelections,
            this.selectedClients()
        );
        
        if (hasChanges) {
            this.selectedClients.set([...this.pendingClientSelections]);
            this.onApplyFilters();
        }
    }

    private applyPendingSellerFilters(): void {
        // Check if pending selections differ from current selections
        const hasChanges = this.hasSelectionChanges(
            this.pendingSellerSelections,
            this.selectedSellers()
        );
        
        if (hasChanges) {
            this.selectedSellers.set([...this.pendingSellerSelections]);
            this.onApplyFilters();
        }
    }

    private hasSelectionChanges(pending: FilterOption[], current: FilterOption[]): boolean {
        if (pending.length !== current.length) {
            return true;
        }
        
        const pendingValues = new Set(pending.map(p => p.value));
        const currentValues = new Set(current.map(c => c.value));
        
        for (const value of pendingValues) {
            if (!currentValues.has(value)) {
                return true;
            }
        }
        
        return false;
    }

    private onApplyFilters(): void {
        this.currentPage.set(0);
        this.findAll();
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
