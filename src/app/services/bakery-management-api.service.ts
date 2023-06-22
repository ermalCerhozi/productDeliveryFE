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

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}users`)
    }

    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}users/${id}`)
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}products`)
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}products/${id}`)
    }

    createProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}products`, product)
    }

    updateProduct(product: Product, result: Partial<Product>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}products/${product.id}`, result)
    }

    deleteProduct(id: number): Observable<Product> {
        return this.http.delete<any>(`${this.apiUrl}products/${id}`)
    }
}
