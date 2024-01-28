import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { ProductEntity } from 'src/shared/models/product.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { SearchOptions } from 'src/shared/models/navigation-context.model'
import { MediaLibrarySearchService } from 'src/services/media-library-search-service.service'
import { take, map } from 'rxjs/operators'
import { DropdownEvent, DropdownMenuListItem } from 'src/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/shared/models/actionOptions'

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageProductsComponent implements OnInit {
    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    @ViewChild(MatPaginator) paginator!: MatPaginator

    dataSource: MatTableDataSource<ProductEntity> = new MatTableDataSource<ProductEntity>([])
    isLoading = false
    hasMoreProductsToLoad = false

    constructor(
        public bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        private searchService: MediaLibrarySearchService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getProducts(true)
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator
        this.paginator.page.subscribe((event) => {
            if (event.pageIndex > event.previousPageIndex!) {
                this.getProducts(true)
            }
        })
    }

    actionDropdown: DropdownMenuListItem[] = [
        {
            label: DropdownActionOptions.EDIT,
            icon: 'edit',
        },
        {
            label: DropdownActionOptions.DELETE,
            icon: 'delete',
        },
    ]

    getProducts(append: boolean) {
        this.isLoading = true
        this.bakeryManagementService.updateProductList(append).subscribe({
            next: () => {
                this.isLoading = false
                this.bakeryManagementService.productsList$.subscribe((products) => {
                    this.dataSource.data = products
                })
            },
            error: (error) => {
                this.isLoading = false
                console.log('Error: ', error)
            },
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
                            next: (res) => {
                                this.bakeryManagementService.productsList$.pipe(
                                    take(1),
                                    map((products: any[]) => {
                                        products.unshift(res);
                                        return products;
                                    })
                                ).subscribe((products) => {
                                    this.dataSource.data = products;
                                });
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    } else if (action === 'update' && product) {
                        this.bakeryManagementApiService.updateProduct(product, result).subscribe({
                            next: () => {
                                this.bakeryManagementService.productsList$.subscribe((products) => {
                                    this.dataSource.data = products
                                })
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
                            this.bakeryManagementService.productsList$.subscribe((products) => {
                                this.dataSource.data = products
                            })
                        },
                        error: (error) => {
                            console.log('Error: ', error)
                        },
                    })
                }
            },
        })
    }

    getSearchOptions(): SearchOptions {
        return this.searchService.getSearchOptions()
    }

    setSearchQuery(data: string) {
        this.searchService.setSearchQuery(data)
    }

    setSearchOptions(searchOptions: SearchOptions) {
        this.searchService.setSearchOptions(searchOptions)
    }

    onDropdownMenuClick(item: DropdownEvent, product: ProductEntity): void {
        const { option } = item
        switch (option.label) {
            case DropdownActionOptions.EDIT:
                this.createUpdateProduct('update', product)
                break
            case DropdownActionOptions.DELETE:
                this.deleteProduct(product)
                break
            default:
                break
        }
    }
}
