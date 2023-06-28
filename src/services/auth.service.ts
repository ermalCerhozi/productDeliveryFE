import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { UserEntity, LoginModel } from 'src/core/models/user.model'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl = 'http://localhost:3000/users'

    constructor(private http: HttpClient) {}

    login(loginForm: LoginModel): Observable<UserEntity> {
        return this.http.post<any>(
            `${this.baseUrl}/login`,
            { phone_number: loginForm.phoneNumber, password: loginForm.password },
            { withCredentials: true }
        )
    }

    getLoggedInUser(): Observable<UserEntity> {
        return this.http.get<UserEntity>(`${this.baseUrl}/loggedInUser`, { withCredentials: true })
    }

    logout(): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/logout`, { withCredentials: true })
    }
}
