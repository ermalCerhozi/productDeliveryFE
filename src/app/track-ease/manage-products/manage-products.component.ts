import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    TemplateRef,
    OnDestroy,
    ChangeDetectorRef,
    inject,
} from '@angular/core'
import { NgTemplateOutlet, NgIf, DecimalPipe } from '@angular/common'

import { Subject } from 'rxjs'
import { take, map, takeUntil, finalize } from 'rxjs/operators'
import { MatButton } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatIcon } from '@angular/material/icon'
import { MatMenuTrigger } from '@angular/material/menu'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import {
    MatTableDataSource,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
} from '@angular/material/table'

import { ProductEntity } from 'src/app/shared/models/product.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { CreateUpdateProductDialogComponent } from 'src/app/shared/components/create-update-product-dialog/create-update-product-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { DropdownEvent, DropdownMenuListItem } from 'src/app/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/app/shared/models/actionOptions'
import { SearchService } from 'src/app/services/search.service'
import { DropdownMenuListComponent } from '../../shared/components/dropdown-menu-list/dropdown-menu-list.component'
import { TopBarComponent } from '../../shared/components/top-bar/top-bar.component'
import { CreateUpdateProductDialogComponent as CreateUpdateProductDialogComponent_1 } from '../../shared/components/create-update-product-dialog/create-update-product-dialog.component'
import { ConfirmationDialogComponent as ConfirmationDialogComponent_1 } from '../../shared/components/confirmation-dialog/confirmation-dialog.component'

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgTemplateOutlet,
        MatTable,
        MatColumnDef,
        MatHeaderCellDef,
        MatHeaderCell,
        MatCellDef,
        MatCell,
        MatButton,
        MatMenuTrigger,
        MatIcon,
        DropdownMenuListComponent,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MatNoDataRow,
        NgIf,
        MatProgressSpinner,
        MatPaginator,
        TopBarComponent,
    CreateUpdateProductDialogComponent_1,
        ConfirmationDialogComponent_1,
        DecimalPipe,
    ],
})
export class ManageProductsComponent implements OnInit, AfterViewInit, OnDestroy {
    public bakeryManagementService = inject(BakeryManagementService)
    private bakeryManagementApiService = inject(BakeryManagementApiService)
    private searchService = inject(SearchService)
    public dialog = inject(MatDialog)
    private cdr = inject(ChangeDetectorRef)

    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild('createUpdateContainer')
    createUpdateContainer!: TemplateRef<CreateUpdateProductDialogComponent>
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>
    
    private destroy$ = new Subject<void>()

    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    activeProduct!: ProductEntity
    actionState!: 'create' | 'update'

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

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.bakeryManagementService.activeTab = 'products'

        this.bakeryManagementService.productsList$
            .pipe(takeUntil(this.destroy$))
            .subscribe((products) => {
                this.dataSource.data = products
                this.cdr.markForCheck()
            })
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    ngAfterViewInit() {
        this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe((event: PageEvent) => {
            const pageSizeChanged = this.bakeryManagementService.navigationContext.pagination.limit !== event.pageSize;

            this.bakeryManagementService.navigationContext.pagination.limit = event.pageSize;
            this.bakeryManagementService.navigationContext.pagination.offset = event.pageIndex * event.pageSize;
            if (event.pageIndex > event.previousPageIndex!) {
                this.getProductsList(true);
            }
            if (pageSizeChanged) {
                this.getProductsList(false);
            }
        });

        this.getProductsList(false)
    }

    getProductsList(append: boolean) {
        this.isLoading = true

        this.bakeryManagementService
            .updateProductList(append)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.isLoading = false
                    this.cdr.markForCheck()
                })
            )
            .subscribe({
                error: (error: any) => {
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
            width: '100vh',
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
