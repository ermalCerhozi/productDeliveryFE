import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationDialogComponent } from 'src/shared/components/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/shared/components/create-update-dialog/create-update-dialog.component'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { OrderEntity } from 'src/shared/models/order.model'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { SelectionModel } from '@angular/cdk/collections'
import { DropdownEvent, DropdownMenuListItem } from 'src/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/shared/models/actionOptions'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'

@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.css'],
})
export class ManageOrdersComponent implements OnInit {
    selection = new SelectionModel<any>(true, [])
    activeOrder!: OrderEntity
    actionState!: string

    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

    dataSource: any

    isLoading = false

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
    }

    getOrdersList(append: boolean) {
        this.isLoading = true
        this.bakeryManagementService.updateOrdersList(append).subscribe({
            next: () => {
                this.isLoading = false
                this.bakeryManagementService.productsList$.subscribe((products) => {
                    this.dataSource = products
                })
                console.log('Orders List: ', this.dataSource)
            },
            error: (error) => {
                this.isLoading = false
                console.log('Error: ', error)
            },
        })
    }

    onDropdownMenuClick(item: DropdownEvent, product: OrderEntity): void {
        this.activeOrder = product
        const { option } = item
        switch (option.label) {
            case DropdownActionOptions.EDIT:
                this.actionState = 'update'
                // this.openCreateUpdateProduct()
                break
            case DropdownActionOptions.DELETE:
                this.deleteOrder()
                break
            default:
                break
        }
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

    downloadSelectedOrders() {
        this.bakeryManagementService.downloadSelected(this.selection)
    }

    createUpdateOrder(action: string, order?: OrderEntity): void {
        const dialogRef = this.dialog.open(CreateUpdateDialogComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '100%',
            width: '100%',
            data: { action, type: 'order', order },
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
                        this.bakeryManagementApiService.updateOrder(order, result).subscribe({
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
}
