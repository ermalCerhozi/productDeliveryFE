import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    TemplateRef,
} from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { ProductEntity } from 'src/shared/models/product.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { CreateUpdateDialogComponent } from 'src/shared/components/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/shared/components/confirmation-dialog/confirmation-dialog.component'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { SearchOptions } from 'src/shared/models/navigation-context.model'
import { MediaLibrarySearchService } from 'src/services/media-library-search-service.service'
import { take, map } from 'rxjs/operators'
import { DropdownEvent, DropdownMenuListItem } from 'src/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/shared/models/actionOptions'
import { Observable } from 'rxjs'
import { UserEntity } from 'src/shared/models/user.model'

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageProductsComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['id', 'product_name', 'price', 'actions']
    activeProduct: ProductEntity | undefined
    actionState!: string | undefined
    @ViewChild(MatPaginator) paginator!: MatPaginator

    @ViewChild('createUpdateContainer')
    createUpdateContainer!: TemplateRef<CreateUpdateDialogComponent>
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

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
        private searchService: MediaLibrarySearchService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.getProductsList(false)
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
            maxWidth: '100%',
            maxHeight: '80%',
        })
    }

    deleteProduct(): void {
        this.dialog.open(this.confirmationDialogContainer, {
            width: '80%',
            height: '25%',
        })
    }

    getSearchOptions(): SearchOptions {
        return this.searchService.getSearchOptions()
    }

    getSeller() {
        return JSON.parse(localStorage.getItem('currentUser') || '')
    }

    getProducts(): Observable<ProductEntity[]> {
        return this.bakeryManagementService.productsList$
    }

    // TODO: Remove mock data and lazy load actual users
    getClients() {
        const mockUsers: UserEntity[] = [
            {
                id: 1,
                created_at: '2022-01-01T00:00:00Z',
                updated_at: '2022-01-02T00:00:00Z',
                first_name: 'John',
                last_name: 'Doe',
                nickname: 'johndoe',
                phone_number: '1234567890',
                role: 'admin',
                password: 'password1',
            },
            {
                id: 2,
                created_at: '2022-01-03T00:00:00Z',
                updated_at: '2022-01-04T00:00:00Z',
                first_name: 'Jane',
                last_name: 'Doe',
                nickname: 'janedoe',
                phone_number: '0987654321',
                role: 'user',
                password: 'password2',
            },
        ]
        return mockUsers
    }

    setSearchQuery(data: string) {
        this.searchService.setSearchQuery(data)
    }

    setSearchOptions(searchOptions: SearchOptions) {
        this.searchService.setSearchOptions(searchOptions)
    }

    createProduct(product: ProductEntity) {
        this.dialog.closeAll()
        this.bakeryManagementApiService.createProduct(product).subscribe({
            next: (res) => {
                this.bakeryManagementService.productsList$
                    .pipe(
                        take(1),
                        map((products: any[]) => {
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
        this.bakeryManagementApiService.updateProduct(this.activeProduct!, product).subscribe({
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

    onDeleteProduct(): void {
        this.dialog.closeAll()
        this.bakeryManagementApiService.deleteProduct(this.activeProduct!.id).subscribe({
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
