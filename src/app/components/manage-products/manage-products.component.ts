import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { ProductEntity } from 'src/core/models/product.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { CdkScrollable } from '@angular/cdk/scrolling'
import { ChangeDetectorRef } from '@angular/core'

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageProductsComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    @ViewChild(CdkScrollable) scroll!: CdkScrollable

    dataSource: MatTableDataSource<ProductEntity> = new MatTableDataSource<ProductEntity>([])
    isLoading = false
    hasMoreProductsToLoad = false

    constructor(
        private bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog,
        private cd: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.getProducts(0, 20)
    }

    ngAfterViewInit() {
        this.scroll.elementScrolled().subscribe(() => {
            const element = this.scroll.getElementRef().nativeElement
            if (
                element.scrollTop + element.clientHeight >= element.scrollHeight - 10 &&
                !this.isLoading
            ) {
                this.loadMoreProducts()
            }
        })
    }

    loadMoreProducts() {
        if (this.isLoading || !this.hasMoreProductsToLoad) return
        const currentLength = this.dataSource.data.length
        this.getProducts(currentLength, 20)
    }

    getProducts(offset: number, limit: number) {
        this.isLoading = true
        this.bakeryManagementService.getAllProducts(offset, limit).subscribe((res) => {
            const newData = [...this.dataSource.data, ...res.products]
            this.dataSource = new MatTableDataSource(newData)

            this.hasMoreProductsToLoad = res.hasMoreItems
            this.isLoading = false
            this.cd.detectChanges()
        })
    }

    // TODO: Fix product update for the product added after the initial 20 items
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
                                // TODO: Just add the item created and do not retrieve the products again
                                this.getProducts(0, 20)
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    } else if (action === 'update' && product) {
                        this.bakeryManagementApiService.updateProduct(product, result).subscribe({
                            next: () => {
                                // TODO: Just update the item updated and do not retrieve the products again
                                this.getProducts(0, 20)
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
                            // TODO: Just remove the item deleted and do not retrieve the products again
                            this.getProducts(0, 20)
                        },
                        error: (error) => {
                            console.log('Error: ', error)
                        },
                    })
                }
            },
        })
    }

    //TODO: Implement filtering in the back end
    applyFilter(event: Event) {
        console.log('filtering...', event)
    }
}
