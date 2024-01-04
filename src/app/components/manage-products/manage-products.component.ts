import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { ProductEntity } from 'src/shared/models/product.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageProductsComponent implements OnInit {
    searchTerm = ''
    isLoading = false
    hasMoreProductsToLoad = false

    constructor(
        private bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getProducts(0, 20)
    }

    getProducts(offset: number, limit: number) {
        this.isLoading = true
        this.bakeryManagementService.getAllProducts(offset, limit).subscribe((res) => {
            this.hasMoreProductsToLoad = res.hasMoreItems
            this.isLoading = false
        })
    }

    getItemList(item: string) {
        switch (item) {
            case 'product':
                return this.bakeryManagementService.productsList.products
            case 'order':
                return this.bakeryManagementService.ordersList.orders
            default:
                return []
        }
    }

    scrolledToBottom(item: string) {
        if (this.bakeryManagementService.hasMoreItemsToLoad(item)) {
            this.bakeryManagementService.loadMoreItems(item)
        }
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
                            next: (res) => {
                                // TODO: update the product list with the new product
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    } else if (action === 'update' && product) {
                        this.bakeryManagementApiService.updateProduct(product, result).subscribe({
                            next: (res) => {
                                // TODO: update the product list with the updated product
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
                            // TODO: Update the product list
                        },
                        error: (error) => {
                            console.log('Error: ', error)
                        },
                    })
                }
            },
        })
    }

    // TODO: Implement pagination on search results
    // TODO: Implement debounce and min length on search input to optimize searchProduct function
    searchProduct(): void {
        this.bakeryManagementApiService.searchProduct(this.searchTerm).subscribe({
            next: (res) => {
                // TODO: find a way to update the product list with the search results
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    clearSearch(): void {
        this.searchTerm = ''
        this.searchProduct()
    }

    editItem(item: any) {
        this.createUpdateProduct('update', item)
    }

    deleteItem(item: any) {
        this.deleteProduct(item)
    }
}
