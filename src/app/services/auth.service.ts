import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { UserEntity, LoginModel } from 'src/app/shared/models/user.model'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = environment.baseUrl + '/users'
    private currentLoggedUser: BehaviorSubject<UserEntity | null>
    private http = inject(HttpClient)
    constructor() {
        const storedUser = localStorage.getItem('currentUser')
        const initialUser = storedUser ? JSON.parse(storedUser) : null
        this.currentLoggedUser = new BehaviorSubject<UserEntity | null>(initialUser)
    }

    login(loginForm: LoginModel): Observable<UserEntity> {
        return this.http.post<any>(
            `${this.baseUrl}/login`,
            { phone_number: loginForm.phoneNumber, password: loginForm.password },
            { withCredentials: true }
        )
    }

    logOut(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/logout`, { withCredentials: true })
    }

    resetPassword(forgotPasswordForm: { email: string }): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/resetPassword`, {
            email: forgotPasswordForm.email,
        })
    }

    public setAuthenticatedUser(user: any): void {
        localStorage.setItem('currentUser', JSON.stringify(user))
        this.currentLoggedUser.next(user)
    }

    public get getAuthenticatedUser(): UserEntity | null {
        return this.currentLoggedUser.value
    }

    public clearAuthenticatedUser(): void {
        this.currentLoggedUser.next(null)
        localStorage.removeItem('currentUser')
    }
}
