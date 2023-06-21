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
}
