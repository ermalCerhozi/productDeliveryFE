import { inject, Injectable } from '@angular/core'
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
import { ImageUploadRequest, ImageResponse } from 'src/app/shared/models/image.model'

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

    private bakeryManagementApiService = inject(BakeryManagementApiService)

    constructor() {
        this.getBaseNavigationContext()
    }

    getBaseNavigationContext(): void {
        this.navigationContext = {
            pagination: {
                offset: 0,
                limit: 10,
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

    setSearchQuery(data: string) {
        if (data !== this.navigationContext.filters.queryString) {
            this.navigationContext.filters.queryString = data
            this.navigationContext.getCount = true
        }
    }

    getPreviousOrder(clientId: number, previousOrderNumber: number): Observable<OrderEntity> {
        return this.bakeryManagementApiService.getPreviousOrderByClient(
            clientId,
            previousOrderNumber
        )
    }

    // TODO: remove this when the interceptor is implemneted to send the logged in user
    getLoggedInUser() {
        return JSON.parse(localStorage.getItem('currentUser') || '')
    }

    fetchUserById(id: number, cacheResult = false): Observable<UserEntity> {
        return this.bakeryManagementApiService.getUser(id).pipe(
            tap((user) => {
                if (cacheResult) {
                    localStorage.setItem('currentUser', JSON.stringify(user))
                }
            })
        )
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

    downloadOrdersCsv(): void {
        const requestPayload: { navigation_context: NavigationContext } = {
            navigation_context: this.navigationContext,
        }
        this.bakeryManagementApiService.downloadOrdersCsv(requestPayload).subscribe((data: any) => {
            const blob = new Blob([data], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'orders.csv'
            link.click()
        })
    }

    uploadImage(payload: ImageUploadRequest): Observable<ImageResponse> {
        return this.bakeryManagementApiService.uploadImage(payload).pipe(
            tap((image) => {
                if (!image) {
                    console.warn('Image upload completed without a payload response')
                    return
                }

                if (!payload.userId) {
                    return
                }

                if (!image.contentType || !image.data) {
                    console.error('Image upload response is missing binary payload metadata')
                    return
                }

                const currentUserRaw = localStorage.getItem('currentUser')
                if (!currentUserRaw) {
                    return
                }

                try {
                    const currentUser = JSON.parse(currentUserRaw) as UserEntity
                    if (currentUser?.id === payload.userId) {
                        const dataUri = `data:${image.contentType};base64,${image.data}`
                        const updatedUser = {
                            ...currentUser,
                            profile_picture: dataUri,
                        }
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
                    }
                } catch (error) {
                    console.error('Failed to update cached user image', error)
                }
            })
        )
    }
}
