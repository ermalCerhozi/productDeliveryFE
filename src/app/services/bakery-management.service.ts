import { Injectable } from '@angular/core'
import { Observable, tap, BehaviorSubject, Subject, take, map } from 'rxjs'
import { OrderEntity, OrderResponse } from 'src/app/shared/models/order.model'
import { ProductEntity, ProductResponse } from 'src/app/shared/models/product.model'
import { UserEntity, UserResponse, changeUserPassword } from 'src/app/shared/models/user.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { NavigationContext } from 'src/app/shared/models/navigation-context.model'
import {
    ProductsFiltersResponse,
    UserFiltersResponse,
} from 'src/app/shared/models/mediaLibraryResponse.model'

@Injectable({
    providedIn: 'root',
})
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

    //TODO: make interface
    public countData: any = {
        countActive: 0,
        // countTypes: [],
        // countMissingData: {
        //     missingAltText: 0,
        //     missingLongDescription: 0,
        // },
    }
    public synchronizeCountSubject = new Subject<void>()
    public synchronizeFiltersSubject = new Subject<void>()

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
        if (!append) {
            this.ordersListSubject.next([])
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

    getProductPricesByIds(ids: number[]): Observable<{ [key: string]: number }> {
        return this.bakeryManagementApiService.getProductPricesByIds(ids)
    }

    // TODO: This is to be deleted after dropdown paginaiton is implemented
    getAllUsers(): Observable<UserEntity[]> {
        return this.bakeryManagementApiService.getUsers()
    }

    // TODO: remove this when the interceptor is implemneted to send the logged in user
    getLoggedInUser() {
        return JSON.parse(localStorage.getItem('currentUser') || '')
    }

    updateUser(user: UserEntity, activeUser = false): void {
        this.bakeryManagementApiService
            .updateUser(user, user)
            .pipe(
                tap((res: UserEntity) => {
                    if (activeUser) {
                        localStorage.setItem('currentUser', JSON.stringify(res))
                    }
                })
            )
            .subscribe()
    }

    changeUserPassword(id: number, newPass: changeUserPassword): void {
        this.bakeryManagementApiService.changeUserPassword(id, newPass).subscribe()
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.bakeryManagementApiService.deleteOrderItem(id)
    }

    synchronizeFilters() {
        this.synchronizeFiltersSubject.next()
    }
    synchronizeCount() {
        this.synchronizeCountSubject.next()
    }

    resetPagination(): void {
        this.navigationContext.pagination.offset = 0
        this.navigationContext.pagination.limit = 40
    }

    clearActiveMedia(): void {
        console.log('Clearing the selected item')
    }

    getClientFiltersForOrder(
        offset: number,
        clientSearchQuery: string
    ): Observable<UserFiltersResponse[]> {
        // const workspaceId = this.localStorageService.retrieve('workspaceId') //TODO: When workspace is implemented
        // const payload: any = { //TODO When proper payload is implemented
        //     workspace_id: workspaceId,
        //     pagination: {
        //         offset,
        //         limit: 20,
        //     },
        // }

        const payload: any = {
            pagination: {
                offset,
                limit: 20,
            },
        }
        if (clientSearchQuery) {
            payload.clientName = clientSearchQuery
        }
        return this.bakeryManagementApiService.getClientFiltersForOrder(payload).pipe(
            take(1),
            map((clientFilters: UserFiltersResponse[]) => clientFilters)
        )
    }

    getSellerFiltersForOrder(
        offset: number,
        sellerSearchQuery: string
    ): Observable<UserFiltersResponse[]> {
        // const workspaceId = this.localStorageService.retrieve('workspaceId') //TODO: When workspace is implemented
        // const payload: any = { //TODO When proper payload is implemented
        //     workspace_id: workspaceId,
        //     pagination: {
        //         offset,
        //         limit: 20,
        //     },
        // }

        const payload: any = {
            pagination: {
                offset,
                limit: 20,
            },
        }
        if (sellerSearchQuery) {
            payload.sellerName = sellerSearchQuery
        }
        return this.bakeryManagementApiService.getSellerFiltersForOrder(payload).pipe(
            take(1),
            map((sellerFilters: UserFiltersResponse[]) => sellerFilters)
        )
    }

    getProductFiltersForOrder(
        offset: number,
        productSearchQuery: string
    ): Observable<ProductsFiltersResponse[]> {
        // const workspaceId = this.localStorageService.retrieve('workspaceId') //TODO: When workspace is implemented
        // const payload: any = { //TODO When proper payload is implemented
        //     workspace_id: workspaceId,
        //     pagination: {
        //         offset,
        //         limit: 20,
        //     },
        // }

        const payload: any = {
            pagination: {
                offset,
                limit: 20,
            },
        }
        if (productSearchQuery) {
            payload.productName = productSearchQuery
        }
        return this.bakeryManagementApiService.getProductFiltersForOrder(payload).pipe(
            take(1),
            map((productFilters: ProductsFiltersResponse[]) => productFilters)
        )
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
