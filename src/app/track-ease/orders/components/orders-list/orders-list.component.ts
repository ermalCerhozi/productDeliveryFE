import {
    Component,
    OnDestroy,
    OnInit,
    inject,
    signal,
    DestroyRef,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AsyncPipe, DatePipe } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

import { Observable, Subject } from 'rxjs'
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
import { SearchService } from 'src/app/services/search.service'
import { AdvancedSelection } from 'src/app/shared/models/advanced-selection.model'
import { FiltersComponent } from '../../../../shared/components/filters/filters.component'
import { SimpleRadioSelectFilterComponent } from '../../../../shared/components/filters/simple-radio-select-filter/simple-radio-select-filter.component'
import { AdvancedTextFilterComponent } from '../../../../shared/components/filters/advanced-text-filter/advanced-text-filter.component'
import { FiltersResultComponent } from '../../../../shared/components/filters-panel/filters-result/filters-result.component'
import { TableComponent } from 'src/app/shared/components/table/table.component'

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
export class OrdersListComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>()
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);
    private bakeryManagementApiService = inject(BakeryManagementApiService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private translocoService = inject(TranslocoService);
    private datePipe = inject(DatePipe);
    public bakeryManagementService = inject(BakeryManagementService);
    public searchService = inject(SearchService);

    filterResults: Observable<FilterOption[]>

    mediaDates: Observable<FilterOption[]>
    defaultDate: FilterOption
    selectedDate: Observable<FilterOption>

    clients: Observable<FilterOption[]>
    selectedClients: Observable<FilterOption[]>
    clientsLoading: Observable<boolean>
    hasMoreClientsToLoad: Observable<boolean>

    sellers: Observable<FilterOption[]>
    selectedSellers: Observable<FilterOption[]>
    sellersLoading: Observable<boolean>
    hasMoreSellersToLoad: Observable<boolean>

    public tableColumns = signal([
        { key: "client", label: "ordersList.client" },
        { key: "order", label: "ordersList.order" },
        { key: "date", label: "ordersList.date" },
    ]);
    public tableData$!: Observable<any[]>;
    public currentPage = signal(1);
    public pageSize = signal(10);
    private ordersMap: Map<number, OrderEntity> = new Map();
    
    activeOrder: OrderEntity | undefined
    loggedInUser!: UserEntity

    action = 'create'

    constructor() {
        this.filterResults = this.searchService.getFilterResults()

        this.mediaDates = this.searchService.getMediaDates()
        this.defaultDate = this.searchService.defaultDateFilter
        this.selectedDate = this.searchService.getSelectedDate()

        this.clients = this.searchService.getClients()
        this.selectedClients = this.searchService.getSelectedClients()
        this.clientsLoading = this.searchService.getClientsLoading()
        this.hasMoreClientsToLoad = this.searchService.getHasMoreClientsToLoad()

        this.sellers = this.searchService.getSellers()
        this.selectedSellers = this.searchService.getSelectedSellers()
        this.sellersLoading = this.searchService.getSellersLoading()
        this.hasMoreSellersToLoad = this.searchService.getHasMoreSellersToLoad()

        // this.mediaTypes = this.searchService.getMediaTypes()
        // this.selectedTypes = this.searchService.getSelectedTypes()
    }

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.loggedInUser = this.bakeryManagementService.getLoggedInUser()
        this.findAll();
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    public findAll(): void {
        const pageSize = this.pageSize();
        const pageIndex = this.currentPage();

        this.tableData$ = this.bakeryManagementApiService.searchOrders(
            pageIndex + 1, // API expects 1-based page numbers
            pageSize,
            this.bakeryManagementService.navigationContext.filters || {}
        ).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(response => {
                this.bakeryManagementService.ordersCount = response.count;
                this.ordersMap.clear();
                return response.orders.map(order => {
                    this.ordersMap.set(order.id, order);
                    return {
                        id: order.id,
                        client: `${order.client.first_name} ${order.client.last_name}`,
                        order: order.order_items.map(item => 
                            `${item.quantity}${item.returned_quantity !== 0 ? ' - ' + item.returned_quantity : ''} ${item.product.product_name}`
                        ).join(', '),
                        date: new Date(order.created_at).toLocaleString('en-GB', { 
                            day: 'numeric', 
                            month: 'numeric', 
                            year: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }).replace(',', '')
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

    clientSearchChange(data: string) {
        this.searchService.clientSearchChange(data)
    }
    loadMoreClients() {
        this.searchService.loadMoreClients()
    }

    sellerSearchChange(data: string) {
        this.searchService.sellerSearchChange(data)
    }
    loadMoreSellers() {
        this.searchService.loadMoreSellers()
    }

    applyFilters(data: FilterOption | FilterOption[] | AdvancedSelection, filterType: string) {
        switch (filterType) {
            // case 'type':
            //     this.searchService.applyTypeFilters(data as FilterOption[])
            //     break
            // case 'missingData':
            //     this.searchService.applyMissingDataFilters(data as FilterOption[])
            //     break
            case 'date':
                this.searchService.applyDateFilter(data as FilterOption)
                break
            case 'client':
                this.searchService.applyClientFilters(data as AdvancedSelection)
                break
            case 'seller':
                this.searchService.applySellerFilters(data as AdvancedSelection)
                break
        }
    }

    removeFilter(data: FilterOption) {
        this.searchService.removeFilter(data)
    }

    clearFilters() {
        this.searchService.clearFilters()
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
        this.bakeryManagementService.downloadOrdersPdf()
    }

    downloadOrdersCsv() {
        this.bakeryManagementService.downloadOrdersCsv()
    }
}
