import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Product } from 'src/app/models/product'
import { User } from 'src/app/models/user'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementApiService {
    private apiUrl = 'http://localhost:3000/'

    constructor(private http: HttpClient) {}

    //CRUD for users
    createUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}users`, user)
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}users`)
    }

    updateUser(user: User, result: Partial<User>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}users/${user.id}`, result)
    }

    deleteUser(id: number): Observable<User> {
        return this.http.delete<any>(`${this.apiUrl}users/${id}`)
    }

    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}users/${id}`)
    }

    //CRUD for products
    createProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}products`, product)
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}products`)
    }

    updateProduct(product: Product, result: Partial<Product>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}products/${product.id}`, result)
    }

    deleteProduct(id: number): Observable<Product> {
        return this.http.delete<any>(`${this.apiUrl}products/${id}`)
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}products/${id}`)
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
