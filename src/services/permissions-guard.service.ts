import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AuthService } from 'src/services/auth.service'
// import { UserRole } from 'src/core/common/enums'

@Injectable({
    providedIn: 'root',
})
export class PermissionsGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        const expectedRoles = route.data['expectedRoles'] as Array<string>

        console.log('here')
        return this.authService.getLoggedInUser().pipe(
            map((user) => {
                if (user) {
                    console.log('user', user)
                    if (expectedRoles.includes(user.role)) {
                        return true
                    } else {
                        return this.router.parseUrl('/not-authorized')
                    }
                } else {
                    return false
                }
            })
        )
    }
}
