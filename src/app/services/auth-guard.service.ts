import { Injectable } from '@angular/core'
import { UrlTree, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from 'src/app/services/auth.service'
import { map } from 'rxjs/operators'

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.authService.getLoggedInUser().pipe(
            map((user) => {
                console.log('user', user)
                if (user) {
                    console.log('user', user)
                    return true
                } else {
                    // Redirect to login page
                    return this.router.parseUrl('')
                }
            })
        )
    }
}
