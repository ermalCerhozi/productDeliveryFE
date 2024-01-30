import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
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
import { Observable } from 'rxjs'
import { CreateUpdateOrdersComponent } from 'src/app/components/create-update-orders/create-update-orders.component'
import { UserEntity } from 'src/shared/models/user.model'

@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.css'],
})
export class ManageOrdersComponent implements OnInit {
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

    dataSource: any
    isLoading = false
    activeOrder!: OrderEntity
    actionState!: string
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

    getOrdersList(append: boolean) {
        this.isLoading = true
        this.bakeryManagementService.updateOrdersList(append).subscribe({
            next: () => {
                this.isLoading = false
                this.bakeryManagementService.ordersList$.subscribe((orders) => {
                    this.dataSource = orders
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
        let products: ProductEntity[]
        let clients: UserEntity[]

        this.bakeryManagementService.getAllProducts().subscribe((res) => {
            products = res
            this.bakeryManagementApiService.getUsers().subscribe((res) => {
                clients = res

                const dialogRef = this.dialog.open(CreateUpdateOrdersComponent, {
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    height: '100%',
                    width: '100%',
                    data: { action, order, seller, products, clients },
                })

                dialogRef.afterClosed().subscribe({
                    next: (result: OrderEntity) => {
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
                                this.bakeryManagementApiService
                                    .updateOrder(order.id, result)
                                    .subscribe({
                                        next: () => {
                                            this.getOrdersList(false)
                                        },
                                        error: (error) => {
                                            console.log('Error: ', error)
                                        },
                                    })
                            }
                        }
                    },
                })
            })
        })
    }

    openFilterOrdersDialog(): void {
        const dialogRef = this.dialog.open(FilterDialogComponent, {
            data: this.bakeryManagementService.navigationContext.filters,
        })
        dialogRef.afterClosed().subscribe({
            next: (result) => {
                if (result) {
                    this.bakeryManagementService.navigationContext.filters = result
                    this.bakeryManagementService.updateOrdersList(false)
                }
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    clearFilters() {
        this.bakeryManagementService.navigationContext.filters = {}
        this.getOrdersList(false)
    }

    deleteOrder(): void {
        this.dialog.open(this.confirmationDialogContainer, {
            width: '80%',
            height: '25%',
        })
    }

    onDeleteProduct(): void {
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

    getProducts(): Observable<ProductEntity[]> {
        return this.bakeryManagementService.productsList$
    }

    isAllSelected() {
        // const numSelected = this.selection.selected.length
        // const numRows = this.bakeryManagementService.ordersList.length
        // return numSelected === numRows
        return false
    }

    isAllUnselected() {
        return this.selection.selected.length === 0
    }

    toggleAll() {
        // this.isAllSelected()
        //     ? this.selection.clear()
        //     : this.bakeryManagementService.ordersList.forEach((row) => this.selection.select(row))
    }

    downloadSelectedOrders() {
        this.bakeryManagementService.downloadSelected(this.selection)
    }
}
