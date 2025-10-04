import { inject, Injectable } from '@angular/core'

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
    private authService= inject(AuthService)

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 400 && error.error?.message === 'Your token is invalid!') {
                    this.authService.logOut()
                } else if (
                    error.status === 401 &&
                    error.error?.message === 'Your token has expired'
                ) {
                    // TODO: refresh token
                    // Currently the token refresh logic is not implemented in the back end
                }
                return throwError(() => error)
            })
        )
    }
}
