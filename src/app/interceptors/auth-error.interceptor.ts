import { inject, Injectable } from '@angular/core'
import { Router } from '@angular/router'
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http'
import { catchError, Observable, throwError } from 'rxjs'

import { AuthService } from 'src/app/services/auth.service'
@Injectable({
    providedIn: 'root',
})
export class ErrorInterceptor implements HttpInterceptor {
    private authService = inject(AuthService)
    private router = inject(Router)

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.authService.clearAuthenticatedUser()
                    this.router.navigate(['/login'])
                } else if (error.status === 400 && error.error?.message === 'Your token is invalid!') {
                    this.authService.clearAuthenticatedUser()
                    this.router.navigate(['/login'])
                }
                return throwError(() => error)
            })
        )
    }
}
