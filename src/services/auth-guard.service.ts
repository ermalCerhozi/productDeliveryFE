import { CanActivate, CanActivateChild, UrlTree, Router } from '@angular/router'
import { Observable, of } from 'rxjs'
import { AuthService } from 'src/services/auth.service'
import { catchError, map } from 'rxjs/operators'
import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
    // In this code, AuthGuard implements both CanActivate and CanActivateChild interfaces,
    // and both methods use a common method (checkLogin()) to check whether a user is logged in or not.

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.checkLogin()
    }

    canActivateChild(): Observable<boolean | UrlTree> {
        return this.checkLogin()
    }

    private checkLogin(): Observable<boolean | UrlTree> {
        return this.authService.getLoggedInUser().pipe(
            map((user) => {
                if (user) return true
                return false
            }),
            catchError((error) => {
                if (error.status === 401) {
                    this.router.navigate(['/login'])
                    return of(false)
                } else {
                    // Other errors
                    console.error(error)
                    return of(false)
                }
            })
        )
    }
}
