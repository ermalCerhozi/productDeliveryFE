import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationDialogComponent } from 'src/shared/components/confirmation-dialog/confirmation-dialog.component'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { OrderEntity } from 'src/shared/models/order.model'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { SelectionModel } from '@angular/cdk/collections'
import { DropdownEvent, DropdownMenuListItem } from 'src/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/shared/models/actionOptions'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
import { ProductEntity } from 'src/shared/models/product.model'
import { Observable, forkJoin } from 'rxjs'
import { CreateUpdateOrdersComponent } from 'src/app/components/create-update-orders/create-update-orders.component'
import { UserEntity } from 'src/shared/models/user.model'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'

@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.scss'],
})
export class ManageOrdersComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['client', 'order', 'date', 'actions']
    activeOrder!: OrderEntity
    actionState!: string

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
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {}

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

    onDropdownMenuClick(item: DropdownEvent, order: OrderEntity): void {
        this.activeOrder = order
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

    openFilterOrdersDialog(): void {
        forkJoin({
            sellers: this.bakeryManagementApiService.getSellerUsers(),
            clients: this.bakeryManagementApiService.getClientUsers(),
        }).subscribe(({ sellers, clients }) => {
            // The selected filters
            const sellerId = this.bakeryManagementService.navigationContext.filters?.sellerId
            const clientId = this.bakeryManagementService.navigationContext.filters?.clientId
            const startDate = this.bakeryManagementService.navigationContext.filters?.startDate
            const endDate = this.bakeryManagementService.navigationContext.filters?.endDate

            const dialogRef = this.dialog.open(FilterDialogComponent, {
                data: { sellers, clients, startDate, endDate, sellerId, clientId },
            })

            dialogRef.afterClosed().subscribe({
                next: (result) => {
                    if (result) {
                        this.bakeryManagementService.navigationContext.filters.startDate =
                            result.startDate
                        this.bakeryManagementService.navigationContext.filters.endDate =
                            result.endDate
                        this.bakeryManagementService.navigationContext.filters.clientId =
                            result.client?.id
                        this.bakeryManagementService.navigationContext.filters.sellerId =
                            result.seller?.id
                        this.bakeryManagementService.updateOrdersList(false).subscribe()
                    }
                },
                error: (error) => {
                    console.log('Error: ', error)
                },
            })
        })
    }

    clearFilters() {
        this.bakeryManagementService.navigationContext.filters = {}
        this.getOrdersList(false)
    }

    hasFiltersSelected(): boolean {
        const filters = this.bakeryManagementService.navigationContext.filters
        for (const key in filters) {
            if (
                Object.prototype.hasOwnProperty.call(filters, key) &&
                key !== 'queryString' &&
                key !== 'active' &&
                filters[key] !== undefined
            ) {
                return true
            }
        }
        return false
    }

    deleteOrder(): void {
        this.dialog.open(this.confirmationDialogContainer, {
            width: '80%',
            height: '25%',
        })
    }

    onDeleteOrder(): void {
        this.dialog.closeAll()
        this.bakeryManagementApiService.deleteOrder(this.activeOrder.id).subscribe({
            next: () => {
                this.getOrdersList(false)
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }
}
