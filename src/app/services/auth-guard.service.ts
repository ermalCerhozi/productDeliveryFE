import { Injectable } from '@angular/core'
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router'
import { Observable, of } from 'rxjs'
import { AuthService } from 'src/app/services/auth.service'

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.checkLogin()
    }

    canActivateChild(): Observable<boolean | UrlTree> {
        return this.checkLogin()
    }

    private checkLogin(): Observable<boolean | UrlTree> {
        const currentUser = this.authService.getAuthenticatedUser

        if (currentUser) {
            return of(true)
        } else {
            return of(this.router.parseUrl('/not-found'))
        }
    }
}
