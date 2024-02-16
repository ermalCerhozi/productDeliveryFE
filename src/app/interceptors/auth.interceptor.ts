import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http'
import { Observable } from 'rxjs'

// TODO: This interceptor is currently not in use. It is a placeholder for future use.
// The is no need to pass the Access JWT token since it is currently stored in the cookies...
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    //TODO: implement workspaceId
    // private static readonly workspaceIdKey = 'workspaceId'

    public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // const workspaceId = this.localStorage.retrieve(AuthInterceptor.workspaceIdKey)
        // if (!workspaceId) {
        //     throw new Error('Cannot retrieve workspace ID from local storage')
        // }

        const clonedRequest = req.clone({
            setHeaders: {
                // [AuthInterceptor.workspaceIdKey]: workspaceId,
            },
        })
        return next.handle(clonedRequest)
    }
}
