import { inject, Injectable } from '@angular/core'

import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse,
} from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { SnackBarService } from 'src/app/services/snackbar.service'

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
    private snackBarService = inject(SnackBarService)

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const request = req.withCredentials ? req : req.clone({ withCredentials: true })

        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                this.snackBarService.showError(err.error.message || err.message || err.error)
                return throwError(() => err)
            })
        )
    }
}
