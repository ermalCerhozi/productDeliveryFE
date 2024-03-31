import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { OrderEntity } from 'src/app/shared/models/order.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { SelectionModel } from '@angular/cdk/collections'
import { DropdownEvent, DropdownMenuListItem } from 'src/app/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/app/shared/models/actionOptions'
import { Observable, Subject, forkJoin } from 'rxjs'
import { CreateUpdateOrdersComponent } from 'src/app/track-ease/create-update-orders/create-update-orders.component'
import { UserEntity } from 'src/app/shared/models/user.model'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { SearchService } from 'src/app/services/search.service'
import { AdvancedSelection } from 'src/app/shared/models/advanced-selection.model'

@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.scss'],
})
export class ManageOrdersComponent implements OnInit, AfterViewInit, OnDestroy {
    unsubscribe = new Subject<void>()
    filterResults: Observable<FilterOption[]>

    mediaDates: Observable<FilterOption[]>
    defaultDate: FilterOption
    selectedDate: Observable<FilterOption>

    orderClients: Observable<FilterOption[]>
    selectedClients: Observable<FilterOption[]>
    clientsLoading: Observable<boolean>
    hasMoreClientsToLoad: Observable<boolean>

    orderSellers: Observable<FilterOption[]>
    selectedSellers: Observable<FilterOption[]>
    sellersLoading: Observable<boolean>
    hasMoreSellersToLoad: Observable<boolean>

    // selectedTypes: Observable<FilterOption[]>
    // mediaTypes: Observable<FilterOption[]>
    // loadingTypeFilter = { value: true }

    displayedColumns: string[] = ['client', 'order', 'date', 'actions']
    activeOrder: OrderEntity | undefined

    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

    dataSource: MatTableDataSource<OrderEntity> = new MatTableDataSource<OrderEntity>([])
    isLoading = false
    loggedInUser!: UserEntity

    selection = new SelectionModel<any>(true, []) //to be removed

    actionDropdown: DropdownMenuListItem[] = [
        {
            label: DropdownActionOptions.EDIT,
            icon: 'edit',
        },
        {
            label: DropdownActionOptions.DELETE,
            icon: 'delete',
        },
    ]

    constructor(
        public bakeryManagementService: BakeryManagementService,
        public searchService: SearchService,
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {
        this.filterResults = this.searchService.getFilterResults()

        this.mediaDates = this.searchService.getMediaDates()
        this.defaultDate = this.searchService.defaultDateFilter
        this.selectedDate = this.searchService.getSelectedDate()

        this.orderClients = this.searchService.getOrderClients()
        this.selectedClients = this.searchService.getSelectedClients()
        this.clientsLoading = this.searchService.getClientsLoading()
        this.hasMoreClientsToLoad = this.searchService.getHasMoreClientsToLoad()

        this.orderSellers = this.searchService.getOrderSellers()
        this.selectedSellers = this.searchService.getSelectedSellers()
        this.sellersLoading = this.searchService.getSellersLoading()
        this.hasMoreSellersToLoad = this.searchService.getHasMoreSellersToLoad()

        // this.mediaTypes = this.searchService.getMediaTypes()
        // this.selectedTypes = this.searchService.getSelectedTypes()
    }

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.getOrdersList(false)
        this.loggedInUser = this.bakeryManagementService.getLoggedInUser()
    }

    ngAfterViewInit() {
        // this.dataSource.paginator = this.paginator
        this.paginator.page.subscribe((event) => {
            if (event.pageIndex > event.previousPageIndex!) {
                this.getOrdersList(true)
            }
        })
    }

    getOrdersList(append: boolean) {
        this.isLoading = true
        this.bakeryManagementService.updateOrdersList(append).subscribe({
            next: () => {
                this.isLoading = false
                this.bakeryManagementService.ordersList$.subscribe((orders) => {
                    this.dataSource = new MatTableDataSource(orders) //TODO:
                    this.dataSource.paginator = this.paginator
                })
            },
            error: (error) => {
                this.isLoading = false
                console.log('Error: ', error)
            },
        })
    }

    selectOrder(order: OrderEntity): void {
        this.activeOrder = order
    }

    onDropdownMenuClick(item: DropdownEvent): void {
        const { option } = item
        switch (option.label) {
            case DropdownActionOptions.EDIT:
                this.openCreateUpdateOrder('update', this.activeOrder)
                break
            case DropdownActionOptions.DELETE:
                this.deleteOrder()
                break
            default:
                break
        }
    }

    openCreateUpdateOrder(action: string, order?: OrderEntity): void {
        const seller = this.loggedInUser

        // TODO: Improve
        forkJoin({
            products: this.bakeryManagementService.getAllProducts(),
            clients: this.bakeryManagementApiService.getClientUsers(),
        }).subscribe(({ products, clients }) => {
            const dialogRef = this.dialog.open(CreateUpdateOrdersComponent, {
                maxWidth: '100vw',
                maxHeight: '100vh',
                height: '100%',
                width: '100%',
                data: { action, order, seller, products, clients },
            })

            dialogRef.afterClosed().subscribe((result: OrderEntity) => {
                if (result) {
                    if (action === 'create') {
                        this.bakeryManagementApiService.createOrder(result).subscribe({
                            next: () => {
                                this.getOrdersList(false)
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    } else if (action === 'update' && order) {
                        this.bakeryManagementApiService.updateOrder(order.id, result).subscribe({
                            next: () => {
                                this.getOrdersList(false)
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    }
                }
            })
        })
    }

    clearFilters() {
        this.searchService.clearFilters()
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

    deleteOrder(): void {
        this.dialog.open(this.confirmationDialogContainer, {
            width: '80%',
            height: '25%',
        })
    }

    onDeleteOrder(): void {
        this.dialog.closeAll()
        this.bakeryManagementApiService.deleteOrder(this.activeOrder!.id).subscribe({
            next: () => {
                this.getOrdersList(false)
                this.activeOrder = undefined
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    downloadOrdersPdf() {
        this.bakeryManagementService.downloadOrdersPdf()
    }

    ngOnDestroy() {
        this.unsubscribe.next()
        this.unsubscribe.complete()
    }
}
