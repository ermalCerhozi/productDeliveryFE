import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ProductResponse, ProductEntity } from 'src/trackEase/shared/models/product.model'
import { UserEntity, UserResponse, changeUserPassword } from 'src/trackEase/shared/models/user.model'
import { environment } from 'src/environments/environment'
import { OrderResponse } from 'src/trackEase/shared/models/order.model'
import { NavigationContext } from 'src/trackEase/shared/models/navigation-context.model'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementApiService {
    private apiUrl = environment.baseUrl

    constructor(private http: HttpClient) {}

    //CRUD for users
    createUser(user: UserEntity): Observable<UserEntity> {
        return this.http.post<UserEntity>(`${this.apiUrl}users`, user)
    }

    getUsers(): Observable<UserEntity[]> {
        return this.http.get<UserEntity[]>(`${this.apiUrl}users`)
    }

    // TODO:take only user
    // TODO: when the logged in user edits its info update teh user info in the local storage
    updateUser(user: UserEntity, result: Partial<UserEntity>): Observable<any> {
        console.log(user)
        return this.http.patch<UserEntity>(`${this.apiUrl}users/${user.id}`, result)
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}users/${id}`)
    }

    getUser(id: number): Observable<UserEntity> {
        return this.http.get<UserEntity>(`${this.apiUrl}users/${id}`)
    }

    searchUsers(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<UserResponse> {
        return this.http.post<UserResponse>(
            `${this.apiUrl}users/search`,
            requestPayload.navigation_context
        )
    }

    getSellerUsers(): Observable<UserEntity[]> {
        return this.http.get<UserEntity[]>(`${this.apiUrl}users/seller`)
    }

    getClientUsers(): Observable<UserEntity[]> {
        return this.http.get<UserEntity[]>(`${this.apiUrl}users/client`)
    }

    changeUserPassword(id: number, newPass: changeUserPassword): Observable<any> {
        return this.http.patch<UserEntity>(`${this.apiUrl}users/${id}/password`, newPass)
    }

    //CRUD for products
    createProduct(product: ProductEntity): Observable<ProductEntity> {
        return this.http.post<ProductEntity>(`${this.apiUrl}products`, product)
    }

    searchProduct(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<ProductResponse> {
        return this.http.post<ProductResponse>(
            `${this.apiUrl}products/search`,
            requestPayload.navigation_context
        )
    }

    updateProduct(
        product: ProductEntity,
        result: Partial<ProductEntity>
    ): Observable<ProductEntity> {
        return this.http.put<ProductEntity>(`${this.apiUrl}products/${product.id}`, result)
    }

    deleteProduct(id: number): Observable<ProductEntity> {
        return this.http.delete<ProductEntity>(`${this.apiUrl}products/${id}`)
    }

    getProduct(id: number): Observable<ProductEntity> {
        return this.http.get<ProductEntity>(`${this.apiUrl}products/${id}`)
    }

    getProducts(): Observable<ProductEntity[]> {
        return this.http.get<ProductEntity[]>(`${this.apiUrl}products`)
    }

    //CRUD for orders
    createOrder(order: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}orders`, order)
    }

    getOrders(): Observable<OrderResponse> {
        return this.http.get<any>(`${this.apiUrl}orders`)
    }

    updateOrder(orderId: number, result: Partial<any>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}orders/${orderId}`, result)
    }

    deleteOrder(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}orders/${id}`)
    }

    getOrder(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}orders/${id}`)
    }

    //CRUD for order items
    getFilteredOrders(requestPayload: {
        navigation_context: NavigationContext
    }): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(
            `${this.apiUrl}orders/search`,
            requestPayload.navigation_context
        )
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}order-items/${id}`)
    }

    //Download orders
    downloadOrdersPdf(requestPayload: { navigation_context: NavigationContext }): Observable<Blob> {
        return this.http.post(`${this.apiUrl}orders/download`, requestPayload.navigation_context, {
            responseType: 'blob',
        })
    }
}
