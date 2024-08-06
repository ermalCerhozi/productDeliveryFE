import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router'
import { Observable, of } from 'rxjs'
import { UserEntity } from 'src/app/shared/models/user.model'
import { AuthService } from 'src/app/services/auth.service'
// import { UserRole } from 'src/shared/common/enums'

@Injectable({
    providedIn: 'root',
})
export class PermissionsGuard  {
    currentUser!: UserEntity | null

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        this.currentUser = this.authService.getAuthenticatedUser
        const expectedRoles = route.data['expectedRoles'] as Array<string>

        if (this.currentUser && expectedRoles.includes(this.currentUser.role)) {
            return of(true)
        } else {
            // return of(false)
            return of(this.router.parseUrl('/not-authorized'))
        }
    }
}
