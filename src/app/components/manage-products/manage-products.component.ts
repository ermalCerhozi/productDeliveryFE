import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { Product } from 'src/app/models/product'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { CreateUpdateProductDialogComponent } from 'src/app/modals/create-product-dialog/create-update-product-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'
/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.css'],
})
export class ManageProductsComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>([])

    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild(MatSort) sort!: MatSort

    constructor(
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getProducts()
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    getProducts() {
        this.bakeryManagementApiService.getProducts().subscribe((res) => {
            const products: Product[] = res
            this.dataSource = new MatTableDataSource(products)
        })
    }

    openCreateUpdateProductDialog(action: string, product?: Product): void {
        const dialogRef = this.dialog.open(CreateUpdateProductDialogComponent, {
            width: '80%',
            height: '80%',
            data: { action, product },
        })

        dialogRef.afterClosed().subscribe({
            next: (result: Product) => {
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

    openDeleteProductDialog(product: Product): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '80%',
            height: '25%',
            data: product,
        })

        dialogRef.afterClosed().subscribe({
            next: (result: Product) => {
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

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }
}
