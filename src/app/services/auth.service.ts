import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { User } from 'src/app/models/user'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl = 'http://localhost:3000/users'

    constructor(private http: HttpClient) {}

    login(phone_number: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/login`, { phone_number, password })
    }

    getUser(): Observable<User> {
        return this.http.get<any>(`${this.baseUrl}/user`, {})
    }

    logout(): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/logout`, {})
    }
}
