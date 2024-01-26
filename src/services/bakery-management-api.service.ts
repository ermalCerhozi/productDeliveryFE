import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ProductResponse, ProductEntity } from 'src/shared/models/product.model'
import { UserEntity } from 'src/shared/models/user.model'
import { environment } from 'src/environments/environment'
import { OrderEntity } from 'src/shared/models/order.model'

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

    updateUser(user: UserEntity, result: Partial<UserEntity>): Observable<any> {
        return this.http.put<UserEntity>(`${this.apiUrl}users/${user.id}`, result)
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}users/${id}`)
    }

    getUser(id: number): Observable<UserEntity> {
        return this.http.get<UserEntity>(`${this.apiUrl}users/${id}`)
    }

    //CRUD for products
    createProduct(product: ProductEntity): Observable<ProductEntity> {
        return this.http.post<ProductEntity>(`${this.apiUrl}products`, product)
    }

    searchProduct(requestPayload: any): Observable<ProductResponse> {
        const params = new HttpParams()
            .set('offset', offset.toString())
            .set('limit', limit.toString())

        return this.http.get<ProductResponse>(`${this.apiUrl}products`, { params })
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

    //CRUD for orders
    createOrder(order: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}orders`, order)
    }

    getOrders(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}orders`)
    }

    updateOrder(order: any, result: Partial<any>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}orders/${order.id}`, result)
    }

    deleteOrder(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}orders/${id}`)
    }

    getOrder(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}orders/${id}`)
    }

    //CRUD for order items
    getFilteredOrders(params: any) {
        return this.http.get<OrderEntity[]>(`${this.apiUrl}orders/filter`, { params })
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}order-items/${id}`)
    }
}
