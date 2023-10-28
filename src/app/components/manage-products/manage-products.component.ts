import { Component, OnInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ProductEntity } from 'src/core/models/product.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'
/**
 * @title Data table with pagination, and filtering.
 */
@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.css'],
})
export class ManageProductsComponent implements OnInit {
    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    dataSource: MatTableDataSource<ProductEntity> = new MatTableDataSource<ProductEntity>([])

    @ViewChild(MatPaginator) paginator!: MatPaginator

    constructor(
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getProducts()
    }

    getProducts() {
        this.bakeryManagementApiService.getProducts().subscribe((res) => {
            const products: ProductEntity[] = res
            this.dataSource = new MatTableDataSource(products)
            this.dataSource.paginator = this.paginator
        })
    }

    createUpdateProduct(action: string, product?: ProductEntity): void {
        const dialogRef = this.dialog.open(CreateUpdateDialogComponent, {
            width: '80%',
            height: '80%',
            data: { action, type: 'product', product },
        })

        dialogRef.afterClosed().subscribe({
            next: (result: ProductEntity) => {
                if (result) {
                    if (action === 'create') {
                        this.bakeryManagementApiService.createProduct(result).subscribe({
                            next: () => {
                                this.getProducts()
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    } else if (action === 'update') {
                        this.bakeryManagementApiService.updateProduct(product!, result).subscribe({
                            next: () => {
                                this.getProducts()
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

    deleteProduct(product: ProductEntity): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '80%',
            height: '25%',
            data: product,
        })

        dialogRef.afterClosed().subscribe({
            next: (result: ProductEntity) => {
                if (result) {
                    this.bakeryManagementApiService.deleteProduct(product.id).subscribe({
                        next: () => {
                            this.getProducts()
                        },
                        error: (error) => {
                            console.log('Error: ', error)
                        },
                    })
                }
            },
        })
    }

    //TODO: this will filter all the fields of the product entity including description and ingredients which may not be desirable.
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }
}
