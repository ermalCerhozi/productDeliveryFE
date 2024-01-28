import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { ProductEntity } from 'src/shared/models/product.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { ChangeDetectorRef } from '@angular/core'
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { SearchOptions } from 'src/shared/models/navigation-context.model'


@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageProductsComponent implements OnInit {
    searchTerm = ''
    items = 100
    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    @ViewChild(MatPaginator) paginator!: MatPaginator

    dataSource: MatTableDataSource<ProductEntity> = new MatTableDataSource<ProductEntity>([])
    isLoading = false
    hasMoreProductsToLoad = false

    constructor(
        public bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog,
        private cd: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.getProducts(true)
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator
        this.paginator.page.subscribe((event) => {
            console.log('event: ', event.pageIndex, event.previousPageIndex);
            
            if (event.pageIndex > event.previousPageIndex!) {
                this.getProducts(true)
            }
        });
    
      }

    getProducts(append: boolean) {
        this.isLoading = true
        this.bakeryManagementService.updateProductList(append).subscribe({
            next: () => {
                this.isLoading = false
                this.dataSource.data = this.bakeryManagementService.productsList
                this.items = this.bakeryManagementService.productsCount

                this.cd.detectChanges()
                
            },
            error: (error) => {
                this.isLoading = false
                console.log('Error: ', error)
            },
        })
    }

    scrolledToBottom(item: string) {
        // TODO: fix this function
        console.log('scrolled to bottom')
        if (this.bakeryManagementService.hasMoreItemsToLoad(item)) {
            console.log('scrolled and has items')
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

    getSearchOptions() : SearchOptions {
        return this.bakeryManagementService.navigationContext.searchOptions
    }

    setSearchQuery(data: string) {
        console.log('data: ', data);
        
        // this.searchService.setSearchQuery(data)
    }

    setSearchOptions(searchOptions: SearchOptions) {
        console.log('searchOptions: ', searchOptions);
        // this.searchService.setSearchOptions(searchOptions)
    }

    // TODO: Implement debounce and min length on search input to optimize searchProduct function
    // searchProduct(): void {
    //     this.bakeryManagementService.navigationContext.productFilters.search = this.searchTerm
    //     this.getProducts(true)
    //     if (this.dataSource.paginator) {
    //         this.dataSource.paginator.firstPage();
    //     }
    // }

    // TODO: Fix clear search functionality
    // clearSearch(event: Event): void {
    //     event.stopPropagation()
    //     this.searchTerm = ''
    //     this.searchProduct()
    // }
}
