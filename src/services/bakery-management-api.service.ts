import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'
import { environment } from 'src/environments/environment'

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

    getProducts(): Observable<ProductEntity[]> {
        return this.http.get<ProductEntity[]>(`${this.apiUrl}products`)
    }

    updateProduct(product: ProductEntity, result: Partial<ProductEntity>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}products/${product.id}`, result)
    }

    deleteProduct(id: number): Observable<ProductEntity> {
        return this.http.delete<any>(`${this.apiUrl}products/${id}`)
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
}
