import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { Product } from 'src/app/models/product'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { CreateProductDialogComponent } from 'src/app/modals/create-product-dialog/create-product-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { Observable, of, switchMap } from 'rxjs'
/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.css'],
})
export class ManageProductsComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['id', 'product_name', 'price']
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

    openDialog(): Observable<unknown> {
        const dialogRef = this.dialog.open(CreateProductDialogComponent, {
            width: '80%',
            height: '80%',
        })

        return dialogRef.afterClosed().pipe(
            switchMap((result) => {
                if (result) {
                    return this.bakeryManagementApiService.createProduct(result)
                }
                return of(false)
            })
        )
    }

    createProduct(product: Product) {
        this.bakeryManagementApiService.createProduct(product).subscribe((res) => {
            console.log(res)
            this.getProducts()
        })
    }

    editProduct(product: Product) {
        this.bakeryManagementApiService.updateProduct(product).subscribe((res) => {
            console.log(res)
            this.getProducts()
        })
    }

    deleteProduct(id: number) {
        this.bakeryManagementApiService.deleteProduct(id).subscribe((res) => {
            console.log(res)
            this.getProducts()
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
