import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { OrderEntity } from 'src/core/models/order.model'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { SelectionModel } from '@angular/cdk/collections'
import { FormatDatePipe } from 'src/core/common/pipes/format-date.pipe'

/**
 * @title Data table with pagination, and filtering.
 */
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
        public dialog: MatDialog,
        private formatDatePipe: FormatDatePipe
    ) {}

    ngOnInit() {
        this.getOrders()
    }

    getOrders() {
        this.bakeryManagementService.updateOrdersList().subscribe()
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length
        const numRows = this.bakeryManagementService.ordersList.length
        return numSelected === numRows
    }

    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.bakeryManagementService.ordersList.forEach((row) => this.selection.select(row))
    }

    openFilterOrdersDialog(): void {
        const dialogRef = this.dialog.open(FilterDialogComponent)
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

    updateOrderList() {
        console.log('updateOrderList')
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
                    } else if (action === 'update') {
                        this.bakeryManagementApiService.updateOrder(order!, result).subscribe({
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

    applySearch(event: Event) {
        console.log('applySearch', event)
    }
}
