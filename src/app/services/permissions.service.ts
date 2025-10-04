import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import {
    CreatePermissionRequest,
    PermissionEntity,
} from '../shared/models/permission.model'
import { BakeryManagementApiService } from './bakery-management-api.service'

@Injectable({
    providedIn: 'root',
})
export class PermissionsService {
    private readonly permissionsSubject = new BehaviorSubject<PermissionEntity[]>([])
    readonly permissions$ = this.permissionsSubject.asObservable()

    constructor(
        private readonly bakeryManagementApiService: BakeryManagementApiService,
    ) {}

    loadPermissions(): Observable<PermissionEntity[]> {
        return this.bakeryManagementApiService.getPermissions().pipe(
            tap((permissions) => this.permissionsSubject.next(permissions)),
            catchError((error) => {
                return throwError(() => error)
            }),
        )
    }

    createPermission(
        payload: CreatePermissionRequest,
    ): Observable<PermissionEntity> {
        return this.bakeryManagementApiService.createPermission(payload).pipe(
            tap((permission) => {
                const current = this.permissionsSubject.getValue()
                this.permissionsSubject.next([permission, ...current])
            }),
            catchError((error) => {
                return throwError(() => error)
            }),
        )
    }
}
