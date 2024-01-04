import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { OrderEntity } from 'src/shared/models/order.model'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { SelectionModel } from '@angular/cdk/collections'

@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.css'],
})
export class ManageOrdersComponent implements OnInit {
    selection = new SelectionModel<any>(true, [])

    constructor(
        public bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getOrders()
    }

    getOrders() {
        this.bakeryManagementService.updateOrdersList().subscribe()
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length
        const numRows = this.bakeryManagementService.ordersList.orders.length
        return numSelected === numRows
    }

    isAllUnselected() {
        return this.selection.selected.length === 0
    }

    toggleAll() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.bakeryManagementService.ordersList.orders.forEach((row) =>
                  this.selection.select(row)
              )
    }

    openFilterOrdersDialog(): void {
        const dialogRef = this.dialog.open(FilterDialogComponent, {
            data: this.bakeryManagementService.activeFilters,
        })

        dialogRef.afterClosed().subscribe({
            next: (result) => {
                if (result) {
                    this.bakeryManagementService.getFilteredResults(result)
                }
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    clearFilters() {
        this.bakeryManagementService.activeFilters = null
        this.getOrders()
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
                                this.getOrders()
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    } else if (action === 'update' && order) {
                        this.bakeryManagementApiService.updateOrder(order, result).subscribe({
                            next: () => {
                                this.getOrders()
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

    deleteOrder(order: OrderEntity): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '80%',
            height: '25%',
            data: order,
        })

        dialogRef.afterClosed().subscribe({
            next: (result: OrderEntity) => {
                if (result) {
                    this.bakeryManagementApiService.deleteOrder(order.id).subscribe({
                        next: () => {
                            this.getOrders()
                        },
                        error: (error) => {
                            console.log('Error: ', error)
                        },
                    })
                }
            },
        })
    }
}
