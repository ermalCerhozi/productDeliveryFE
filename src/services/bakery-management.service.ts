import { Injectable } from '@angular/core'
import { Observable, tap, BehaviorSubject } from 'rxjs'
import { OrderEntity, OrderResponse } from 'src/shared/models/order.model'
import { ProductEntity, ProductResponse } from 'src/shared/models/product.model'
import { UserEntity, UserResponse } from 'src/shared/models/user.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { NavigationContext, SearchOptions } from 'src/shared/models/navigation-context.model'

@Injectable({
    providedIn: 'root',
})

//TODO: OnDestroy
export class BakeryManagementService {
    public activeTab!: string
    private ordersListSubject: BehaviorSubject<OrderEntity[]> = new BehaviorSubject<OrderEntity[]>(
        []
    )
    public ordersList$: Observable<OrderEntity[]> = this.ordersListSubject.asObservable()

    private productsListSubject: BehaviorSubject<ProductEntity[]> = new BehaviorSubject<
        ProductEntity[]
    >([])
    public productsList$: Observable<ProductEntity[]> = this.productsListSubject.asObservable()

    private usersListSubject: BehaviorSubject<UserEntity[]> = new BehaviorSubject<UserEntity[]>([])
    public usersList$: Observable<UserEntity[]> = this.usersListSubject.asObservable()

    public productsCount!: number
    public ordersCount!: number
    public usersCount!: number
    public navigationContext!: NavigationContext

    constructor(private bakeryManagementApiService: BakeryManagementApiService) {
        this.getBaseNavigationContext()
    }

    getBaseNavigationContext(): void {
        this.navigationContext = {
            pagination: {
                offset: 0,
                limit: 21,
            },
            filters: {},
            // sorts: {
            //     $created_at: SortDirection.DESC,
            // },
            searchOptions: {
                title: true,
                all: false,
            },
            getCount: true,
        }
    }

    updateProductList(append?: boolean): Observable<ProductResponse> {
        if (!append) {
            this.productsListSubject.next([])
            this.navigationContext.pagination.limit = 21
            this.navigationContext.pagination.offset = 0
        }

        const requestPayload: { navigation_context: NavigationContext } = {
            // workspace_id: this.localStorageService.retrieve('workspaceId'),
            navigation_context: this.navigationContext,
        }

        return this.bakeryManagementApiService.searchProduct(requestPayload).pipe(
            tap((response: ProductResponse) => {
                console.log('Products fetched:', response.products.length)
                let newProductsList
                if (append) {
                    newProductsList = [...this.productsListSubject.getValue(), ...response.products]
                } else {
                    newProductsList = response.products
                }
                this.productsListSubject.next(newProductsList)

                this.navigationContext.pagination.offset += this.navigationContext.pagination.limit
                if (this.navigationContext.getCount) {
                    this.productsCount = response.count
                }
            })
        )
    }

    updateOrdersList(append: boolean): Observable<OrderResponse> {
        console.log('Navigation context:', this.navigationContext)
        if (!append) {
            this.productsListSubject.next([])
            this.navigationContext.pagination.limit = 21
            this.navigationContext.pagination.offset = 0
        }

        const requestPayload: { navigation_context: NavigationContext } = {
            // workspace_id: this.localStorageService.retrieve('workspaceId'),
            navigation_context: this.navigationContext,
        }

        return this.bakeryManagementApiService.getFilteredOrders(requestPayload).pipe(
            tap((response: OrderResponse) => {
                console.log('Orders fetched:', response.orders.length)
                let newOrdersList
                if (append) {
                    newOrdersList = [...this.ordersListSubject.getValue(), ...response.orders]
                } else {
                    newOrdersList = response.orders
                }
                this.ordersListSubject.next(newOrdersList)

                this.navigationContext.pagination.offset += this.navigationContext.pagination.limit
                if (this.navigationContext.getCount) {
                    this.ordersCount = response.count
                }
            })
        )
    }

    updateUsersList(append: boolean): Observable<UserResponse> {
        if (!append) {
            this.usersListSubject.next([])
            this.navigationContext.pagination.limit = 21
            this.navigationContext.pagination.offset = 0
        }

        const requestPayload: { navigation_context: NavigationContext } = {
            // workspace_id: this.localStorageService.retrieve('workspaceId'),
            navigation_context: this.navigationContext,
        }

        return this.bakeryManagementApiService.searchUsers(requestPayload).pipe(
            tap((response: UserResponse) => {
                console.log('Users fetched:', response.users.length)
                let newUsersList
                if (append) {
                    newUsersList = [...this.usersListSubject.getValue(), ...response.users]
                } else {
                    newUsersList = response.users
                }
                this.usersListSubject.next(newUsersList)
                this.usersListSubject.next(newUsersList)

                this.navigationContext.pagination.offset += this.navigationContext.pagination.limit
                if (this.navigationContext.getCount) {
                    this.usersCount = response.count
                }
            })
        )
    }

    setSearchQuery(data: string) {
        if (data !== this.navigationContext.filters.queryString) {
            this.navigationContext.filters.queryString = data
            this.navigationContext.getCount = true
            if (this.activeTab === 'users') {
                this.updateUsersList(false).subscribe()
            } else if (this.activeTab === 'products') {
                this.updateProductList(false).subscribe()
            }
        }
    }

    setSearchOptions(searchOptions: SearchOptions) {
        this.navigationContext.searchOptions = searchOptions
        this.navigationContext.getCount = true
    }

    getSearchOptions(): SearchOptions {
        return this.navigationContext.searchOptions
    }

    getAllUsers(): Observable<UserEntity[]> {
        return this.bakeryManagementApiService.getUsers()
    }

    getLoggedInUser() {
        return JSON.parse(localStorage.getItem('currentUser') || '')
    }

    updateUser(user: UserEntity): void {
        this.bakeryManagementApiService.updateUser(user, user).subscribe()
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.bakeryManagementApiService.deleteOrderItem(id)
    }

    clearFilters(): void {
        this.getBaseNavigationContext()
        // this.updateProductList(false).subscribe()
    }

    getAllProducts(): Observable<ProductEntity[]> {
        return this.bakeryManagementApiService.getProducts()
    }

    downloadOrdersPdf(): void {
        const requestPayload: { navigation_context: NavigationContext } = {
            navigation_context: this.navigationContext,
        }

        this.bakeryManagementApiService.downloadOrdersPdf(requestPayload).subscribe((data: any) => {
            const blob = new Blob([data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'orders.pdf'
            link.click()
        })
    }
}
