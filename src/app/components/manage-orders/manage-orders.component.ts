import { Component, OnInit, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { OrderEntity } from 'src/core/models/order.model'
import { BreakpointObserver } from '@angular/cdk/layout'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'

@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.css'],
})
export class ManageOrdersComponent implements OnInit {
    displayedColumns: string[] = ['id', 'seller', 'client', 'product', 'order_date', 'actions']
    dataSource: MatTableDataSource<OrderEntity> = new MatTableDataSource<OrderEntity>([])

    isLargeScreen: boolean | undefined

    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild(MatSort) sort!: MatSort

    constructor(
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog,
        private breakpointObserver: BreakpointObserver
    ) {}

    ngOnInit() {
        this.getOrders()
        this.breakpointObserver.observe(['(max-width: 414px)']).subscribe((result) => {
            if (result.matches) {
                this.isLargeScreen = false
                this.displayedColumns = ['seller', 'client', 'product', 'order_date', 'actions']
            } else {
                this.isLargeScreen = true
                this.displayedColumns = [
                    'id',
                    'seller',
                    'client',
                    'product',
                    'order_date',
                    'actions',
                ]
            }
        })
    }

    getOrders() {
        this.bakeryManagementApiService.getOrders().subscribe((res) => {
            const orders: OrderEntity[] = res
            this.dataSource = new MatTableDataSource(orders)
            this.dataSource.paginator = this.paginator
            this.dataSource.sort = this.sort
        })
    }

    openFilterOrdersDialog(): void {
        const dialogRef = this.dialog.open(FilterDialogComponent)
        dialogRef.afterClosed().subscribe()
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
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }
}
