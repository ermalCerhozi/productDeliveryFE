import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    TemplateRef,
    OnDestroy,
} from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { ProductEntity } from 'src/app/shared/models/product.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { CreateUpdateDialogComponent } from 'src/app/shared/components/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { take, map } from 'rxjs/operators'
import { DropdownEvent, DropdownMenuListItem } from 'src/app/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/app/shared/models/actionOptions'
import { Subject } from 'rxjs'
import { SearchService } from 'src/app/services/search.service'

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageProductsComponent implements OnInit, AfterViewInit, OnDestroy {
    unsubscribe = new Subject<void>()
    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild('createUpdateContainer')
    createUpdateContainer!: TemplateRef<CreateUpdateDialogComponent>
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    activeProduct!: ProductEntity
    actionState!: string | undefined

    dataSource: MatTableDataSource<ProductEntity> = new MatTableDataSource<ProductEntity>([])
    isLoading = false

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

    constructor(
        public bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        private searchService: SearchService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.getProductsList(false)
        this.bakeryManagementService.activeTab = 'products'
    }

    ngOnDestroy() {
        this.unsubscribe.next()
        this.unsubscribe.complete()
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator
        this.paginator.page.subscribe((event) => {
            if (event.pageIndex > event.previousPageIndex!) {
                this.getProductsList(true)
            }
        })
    }

    getProductsList(append: boolean) {
        this.isLoading = true
        this.isLoading = true
        this.bakeryManagementService.updateProductList(append).subscribe({
            next: () => {
                this.isLoading = false
                this.bakeryManagementService.productsList$.subscribe((product) => {
                    this.dataSource.data = product
                })
            },
            error: (error: any) => {
                this.isLoading = false
                console.log('Error: ', error)
            },
        })
    }

    onDropdownMenuClick(item: DropdownEvent, product: ProductEntity): void {
        this.activeProduct = product
        const { option } = item
        switch (option.label) {
            case DropdownActionOptions.EDIT:
                this.actionState = 'update'
                this.openCreateUpdateProduct()
                break
            case DropdownActionOptions.DELETE:
                this.deleteProduct()
                break
            default:
                break
        }
    }

    addProduct(): void {
        this.actionState = 'create'
        this.openCreateUpdateProduct()
    }

    openCreateUpdateProduct(): void {
        this.dialog.open(this.createUpdateContainer, {
            width: '100%',
            maxHeight: '80%',
        })
    }

    createProduct(product: ProductEntity) {
        this.dialog.closeAll()
        this.bakeryManagementApiService.createProduct(product).subscribe({
            next: (res) => {
                this.bakeryManagementService.productsList$
                    .pipe(
                        take(1),
                        map((products: ProductEntity[]) => {
                            products.unshift(res)
                            return products
                        })
                    )
                    .subscribe((products) => {
                        this.dataSource.data = products
                    })
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    updateProduct(product: ProductEntity) {
        this.dialog.closeAll()
        this.bakeryManagementApiService.updateProduct(this.activeProduct, product).subscribe({
            next: (res) => {
                this.bakeryManagementService.productsList$
                    .pipe(
                        take(1),
                        map((products: ProductEntity[]) => {
                            const index = products.findIndex((p) => p.id === res.id)
                            if (index > -1) {
                                console.log('index: ', index)
                                products[index] = res
                            }
                            return products
                        })
                    )
                    .subscribe((products) => {
                        this.dataSource.data = products
                    })
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    deleteProduct(): void {
        this.dialog.open(this.confirmationDialogContainer, {
            width: '80%',
            maxHeight: '40%',
        })
    }

    onDeleteProduct(): void {
        this.bakeryManagementApiService.deleteProduct(this.activeProduct.id).subscribe({
            next: () => {
                this.bakeryManagementService.productsList$
                    .pipe(
                        take(1),
                        map((products: ProductEntity[]) => {
                            return products.filter(
                                (product) => product.id !== this.activeProduct.id
                            )
                        })
                    )
                    .subscribe((products) => {
                        this.dataSource.data = products
                        this.dialog.closeAll()
                    })
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    getSearchOptions(): SearchOptions {
        return this.searchService.getSearchOptions()
    }

    setSearchQuery(data: string) {
        this.bakeryManagementService.setSearchQuery(data)
    }

    setSearchOptions(searchOptions: SearchOptions) {
        this.searchService.setSearchOptions(searchOptions)
    }
}
