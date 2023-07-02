import { Component, OnInit, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { OrderEntity } from 'src/core/models/order.model'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
/**
 * @title Data table with pagination, and filtering.
 */
@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.css'],
})
export class ManageOrdersComponent implements OnInit {
    displayedColumns: string[] = ['seller', 'client', 'product', 'order_date', 'actions']
    dataSource: MatTableDataSource<OrderEntity> = new MatTableDataSource<OrderEntity>([])

    isLargeScreen: boolean | undefined

    @ViewChild(MatPaginator) paginator!: MatPaginator

    constructor(
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getOrders()
    }

    getOrders() {
        this.bakeryManagementApiService.getOrders().subscribe((res) => {
            const orders: OrderEntity[] = res
            this.dataSource = new MatTableDataSource(orders)
            this.dataSource.paginator = this.paginator
        })
    }

    openFilterOrdersDialog(): void {
        const dialogRef = this.dialog.open(FilterDialogComponent)
        dialogRef.afterClosed().subscribe({
            next: () => {
                this.updateOrderList()
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
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase()

        this.dataSource.filterPredicate = (data: OrderEntity, filter: string) => {
            const accumulator = (currentTerm: string, key: string) => {
                return this.nestedFilterCheck(currentTerm, data, key)
            }
            const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase()
            return dataStr.indexOf(filter) != -1
        }

        this.dataSource.filter = filterValue

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }

    /**
     * Checks if the object property value is a nested object with more properties.
     * If it is, it will call itself recursively until it finds a primitive value,
     * which will then be combined into the accumulator that will be returned.
     */
    nestedFilterCheck(search: string, data: any, key: string) {
        if (typeof data[key] === 'object') {
            for (const k in data[key]) {
                if (data[key][k] !== null) {
                    search = this.nestedFilterCheck(search, data[key], k)
                }
            }
        } else {
            search += ` ${data[key]}`
        }
        return search
    }
}
