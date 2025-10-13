import { inject, Injectable } from '@angular/core'
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { AuthService } from 'src/app/services/auth.service'

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    private authService = inject(AuthService)
    private router = inject(Router)

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkLogin(state.url)
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        return this.checkLogin(state.url)
    }

    private checkLogin(url: string): Observable<boolean | UrlTree> {
        const currentUser = this.authService.getAuthenticatedUser

        if (currentUser) {
            return of(true)
        } else {
            return of(this.router.createUrlTree(['/login']))
        }
    }
}
