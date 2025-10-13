import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ProductResponse, ProductEntity } from 'src/app/shared/models/product.model'
import {
    CreateUserResponse,
    UserEntity,
    UserResponse,
    changeUserPassword,
} from 'src/app/shared/models/user.model'
import { environment } from 'src/environments/environment'
import { OrderEntity, OrderResponse } from 'src/app/shared/models/order.model'
import { NavigationContext } from 'src/app/shared/models/navigation-context.model'
import {
    UserFiltersResponse,
    ProductsFiltersResponse,
} from 'src/app/shared/models/mediaLibraryResponse.model'
import { ImageUploadRequest, ImageResponse } from '../shared/models/image.model'
import {
    PermissionEntity,
    CreatePermissionRequest,
    AssignPermissionsRequest,
    RolePermissionsSummary,
} from '../shared/models/permission.model'
import { SearchOptions } from '../shared/models/context-navigation.model'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementApiService {
    private basePath = environment.baseUrl

    private httpClient = inject(HttpClient)

    //CRUD for users
    createUser(user: Partial<UserEntity>): Observable<CreateUserResponse> {
        return this.httpClient.post<CreateUserResponse>(`${this.basePath}/users`, user)
    }

    getUsers(): Observable<UserEntity[]> {
        return this.httpClient.get<UserEntity[]>(`${this.basePath}/users`)
    }

    // TODO:take only user
    // TODO: when the logged in user edits its info update teh user info in the local storage
    updateUser(user: UserEntity, result: Partial<UserEntity>): Observable<any> {
        console.log(user)
        return this.httpClient.patch<UserEntity>(`${this.basePath}/users/${user.id}`, result)
    }

    deleteUser(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.basePath}/users/${id}`)
    }

    getUser(id: number): Observable<UserEntity> {
        return this.httpClient.get<UserEntity>(`${this.basePath}/users/${id}`)
    }

    searchUsers(
        query: string = '', 
        page: number = 1, 
        pageSize: number = 10,
        searchOptions: SearchOptions = { title: false, all: true }
    ): Observable<UserResponse> {
        return this.httpClient.post<UserResponse>(
            `${this.basePath}/users/search`,
            { query, page, pageSize, searchOptions }
        )
    }

    getSellerUsers(): Observable<UserEntity[]> {
        return this.httpClient.get<UserEntity[]>(`${this.basePath}/users/seller`)
    }

    getClientUsers(): Observable<UserEntity[]> {
        return this.httpClient.get<UserEntity[]>(`${this.basePath}/users/client`)
    }

    changeUserPassword(id: number, newPass: changeUserPassword): Observable<any> {
        return this.httpClient.patch<UserEntity>(`${this.basePath}/users/${id}/password`, newPass)
    }

    //CRUD for products
    createProduct(product: ProductEntity): Observable<ProductEntity> {
        return this.httpClient.post<ProductEntity>(`${this.basePath}/products`, product)
    }

    searchProducts(
        query: string = '', 
        page: number = 1, 
        pageSize: number = 10,
        searchOptions: SearchOptions = { title: false, all: true }
    ): Observable<ProductResponse> {
        return this.httpClient.post<ProductResponse>(
            `${this.basePath}/products/search`,
            { query, page, pageSize, searchOptions }
        )
    }

    searchProduct(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<ProductResponse> {
        return this.httpClient.post<ProductResponse>(
            `${this.basePath}/products/search`,
            requestPayload.navigation_context
        )
    }

    updateProduct(
        product: ProductEntity,
        result: Partial<ProductEntity>
    ): Observable<ProductEntity> {
        return this.httpClient.put<ProductEntity>(`${this.basePath}/products/${product.id}`, result)
    }

    deleteProduct(id: number): Observable<ProductEntity> {
        return this.httpClient.delete<ProductEntity>(`${this.basePath}/products/${id}`)
    }

    getProduct(id: number): Observable<ProductEntity> {
        return this.httpClient.get<ProductEntity>(`${this.basePath}/products/${id}`)
    }

    //CRUD for orders
    createOrder(params: any): Observable<any> {
        return this.httpClient.post<any>(`${this.basePath}/orders`, {
            order: params.newValue,
            notifications: params.sendCreatedNotification,
        })
    }

    getOrderById(id: number): Observable<OrderEntity> {
        return this.httpClient.get<OrderEntity>(`${this.basePath}/orders/${id}`)
    }

    getPreviousOrderByClient(
        clientId: number,
        previousOrderNumber: number
    ): Observable<OrderEntity> {
        const body = { clientId, previousOrderNumber }
        return this.httpClient.post<OrderEntity>(`${this.basePath}/orders/last-order`, body)
    }

    updateOrder(orderId: number, order: any, notifications: any): Observable<any> {
        return this.httpClient.put<any>(`${this.basePath}/orders/${orderId}`, {
            order,
            notifications,
        })
    }

    deleteOrder(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.basePath}/orders/${id}`)
    }

    getOrder(id: number): Observable<any> {
        return this.httpClient.get<any>(`${this.basePath}/orders/${id}`)
    }

    //CRUD for order items
    getFilteredOrders(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<OrderResponse> {
        console.log(requestPayload)
        return this.httpClient.post<OrderResponse>(
            `${this.basePath}/orders/search`,
            requestPayload.navigation_context
        )
    }

    searchOrders(
        page: number = 1,
        pageSize: number = 10,
        filters: any = {}
    ): Observable<OrderResponse> {
        return this.httpClient.post<OrderResponse>(
            `${this.basePath}/orders/search`,
            { page, pageSize, filters }
        )
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.basePath}/order-items/${id}`)
    }

    getClientFiltersForOrder(payload: any): Observable<any[]> {
        return this.httpClient.post<UserFiltersResponse[]>(
            `${this.basePath}/users/clients/search`,
            payload
        )
    }

    getSellerFiltersForOrder(payload: any): Observable<any[]> {
        return this.httpClient.post<UserFiltersResponse[]>(
            `${this.basePath}/users/sellers/search`,
            payload
        )
    }

    getProductFiltersForOrder(payload: any): Observable<any[]> {
        return this.httpClient.post<ProductsFiltersResponse[]>(
            `${this.basePath}/products/paginated/search`,
            payload
        )
    }

    //Download orders
    downloadOrdersPdf(
        page: number = 1,
        pageSize: number = 10,
        filters: any = {}
    ): Observable<Blob> {
        return this.httpClient.post<Blob>(
            `${this.basePath}/orders/download`,
            { page, pageSize, filters },
            { responseType: 'blob' as 'json' }
        )
    }

    downloadOrdersCsv(requestPayload: { navigation_context: NavigationContext }): Observable<Blob> {
        return this.httpClient.post(
            `${this.basePath}/orders/export-csv`,
            requestPayload.navigation_context,
            { responseType: 'blob' }
        )
    }

    uploadImage(payload: ImageUploadRequest): Observable<ImageResponse> {
        return this.httpClient.post<ImageResponse>(`${this.basePath}/images`, payload)
    }

    getPermissions(): Observable<PermissionEntity[]> {
        return this.httpClient.get<PermissionEntity[]>(`${this.basePath}/permissions`)
    }

    createPermission(
        payload: CreatePermissionRequest | CreatePermissionRequest[]
    ): Observable<PermissionEntity | PermissionEntity[]> {
        // Backend expects an array, so wrap single items
        const payloadArray = Array.isArray(payload) ? payload : [payload]
        return this.httpClient.post<PermissionEntity | PermissionEntity[]>(
            `${this.basePath}/permissions`,
            payloadArray
        )
    }

    assignPermissionsToRole(
        roleId: number,
        payload: AssignPermissionsRequest
    ): Observable<PermissionEntity[]> {
        return this.httpClient.put<PermissionEntity[]>(
            `${this.basePath}/permissions/roles/${roleId}`,
            payload
        )
    }

    getRolePermissions(): Observable<RolePermissionsSummary[]> {
        return this.httpClient.get<RolePermissionsSummary[]>(`${this.basePath}/permissions/roles`)
    }

    getMonthlySales(userId: number): Observable<any> {
        return this.httpClient.get<any>(`${this.basePath}/orders/monthly-sales/${userId}`)
    }

    getMonthlyReturns(userId: number): Observable<any> {
        return this.httpClient.get<any>(`${this.basePath}/orders/monthly-returns/${userId}`)
    }

    //This api gets the total sales and hte total returns of the current month
    getTotalSales(): Observable<any> {
        return this.httpClient.get<any>(`${this.basePath}/orders/total-sales`)
    }

    //This api gets the total number of sales for every product in numbers
    getProductsSalesInNumbers(): Observable<any> {
        return this.httpClient.get<any>(`${this.basePath}/orders/sales-numbers`)
    }
}
