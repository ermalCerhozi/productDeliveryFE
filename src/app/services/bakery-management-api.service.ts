import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ProductResponse, ProductEntity } from 'src/app/shared/models/product.model'
import { UserEntity, UserResponse, changeUserPassword } from 'src/app/shared/models/user.model'
import { environment } from 'src/environments/environment'
import { OrderResponse } from 'src/app/shared/models/order.model'
import { NavigationContext } from 'src/app/shared/models/navigation-context.model'
import {
    UserFiltersResponse,
    ProductsFiltersResponse,
} from 'src/app/shared/models/mediaLibraryResponse.model'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementApiService {
    private basePath = environment.baseUrl

    constructor(private httpClient: HttpClient) {}

    //CRUD for users
    createUser(user: UserEntity): Observable<UserEntity> {
        return this.httpClient.post<UserEntity>(`${this.basePath}users`, user)
    }

    getUsers(): Observable<UserEntity[]> {
        return this.httpClient.get<UserEntity[]>(`${this.basePath}users`)
    }

    // TODO:take only user
    // TODO: when the logged in user edits its info update teh user info in the local storage
    updateUser(user: UserEntity, result: Partial<UserEntity>): Observable<any> {
        console.log(user)
        return this.httpClient.patch<UserEntity>(`${this.basePath}users/${user.id}`, result)
    }

    deleteUser(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.basePath}users/${id}`)
    }

    getUser(id: number): Observable<UserEntity> {
        return this.httpClient.get<UserEntity>(`${this.basePath}users/${id}`)
    }

    searchUsers(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<UserResponse> {
        return this.httpClient.post<UserResponse>(
            `${this.basePath}users/search`,
            requestPayload.navigation_context
        )
    }

    getSellerUsers(): Observable<UserEntity[]> {
        return this.httpClient.get<UserEntity[]>(`${this.basePath}users/seller`)
    }

    getClientUsers(): Observable<UserEntity[]> {
        return this.httpClient.get<UserEntity[]>(`${this.basePath}users/client`)
    }

    changeUserPassword(id: number, newPass: changeUserPassword): Observable<any> {
        return this.httpClient.patch<UserEntity>(`${this.basePath}users/${id}/password`, newPass)
    }

    //CRUD for products
    createProduct(product: ProductEntity): Observable<ProductEntity> {
        return this.httpClient.post<ProductEntity>(`${this.basePath}products`, product)
    }

    searchProduct(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<ProductResponse> {
        return this.httpClient.post<ProductResponse>(
            `${this.basePath}products/search`,
            requestPayload.navigation_context
        )
    }

    updateProduct(
        product: ProductEntity,
        result: Partial<ProductEntity>
    ): Observable<ProductEntity> {
        return this.httpClient.put<ProductEntity>(`${this.basePath}products/${product.id}`, result)
    }

    deleteProduct(id: number): Observable<ProductEntity> {
        return this.httpClient.delete<ProductEntity>(`${this.basePath}products/${id}`)
    }

    getProduct(id: number): Observable<ProductEntity> {
        return this.httpClient.get<ProductEntity>(`${this.basePath}products/${id}`)
    }

    getProductPriceById(id: number): Observable<number> {
        return this.httpClient.get<number>(`${this.basePath}products/price/${id}`)
    }

    //CRUD for orders
    createOrder(order: any): Observable<any> {
        return this.httpClient.post<any>(`${this.basePath}orders`, order)
    }

    getOrders(): Observable<OrderResponse> {
        return this.httpClient.get<any>(`${this.basePath}orders`)
    }

    updateOrder(orderId: number, result: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.basePath}orders/${orderId}`, result)
    }

    deleteOrder(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.basePath}orders/${id}`)
    }

    getOrder(id: number): Observable<any> {
        return this.httpClient.get<any>(`${this.basePath}orders/${id}`)
    }

    //CRUD for order items
    getFilteredOrders(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<OrderResponse> {
        console.log(requestPayload)
        return this.httpClient.post<OrderResponse>(
            `${this.basePath}orders/search`,
            requestPayload.navigation_context
        )
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.basePath}order-items/${id}`)
    }

    getClientFiltersForOrder(payload: any): Observable<any[]> {
        return this.httpClient.post<UserFiltersResponse[]>(
            `${this.basePath}users/clients/search`,
            payload
        )
    }

    getSellerFiltersForOrder(payload: any): Observable<any[]> {
        return this.httpClient.post<UserFiltersResponse[]>(
            `${this.basePath}users/sellers/search`,
            payload
        )
    }

    getProductFiltersForOrder(payload: any): Observable<any[]> {
        return this.httpClient.post<ProductsFiltersResponse[]>(
            `${this.basePath}products/paginated/search`,
            payload
        )
    }

    //Download orders
    downloadOrdersPdf(requestPayload: { navigation_context: NavigationContext }): Observable<Blob> {
        return this.httpClient.post(
            `${this.basePath}orders/download`,
            requestPayload.navigation_context,
            {
                responseType: 'blob',
            }
        )
    }
}
