import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import {
    AssignPermissionsRequest,
    CreatePermissionRequest,
    PermissionEntity,
    RolePermissionsSummary,
} from '../shared/models/permission.model'
import { BakeryManagementApiService } from './bakery-management-api.service'

@Injectable({
    providedIn: 'root',
})
export class PermissionsService {
    private permissionsSubject = new BehaviorSubject<PermissionEntity[]>([])
    permissions$ = this.permissionsSubject.asObservable()
    private rolePermissionsSubject = new BehaviorSubject<RolePermissionsSummary[]>([])
    rolePermissions$ = this.rolePermissionsSubject.asObservable()

    constructor(private bakeryManagementApiService: BakeryManagementApiService) {}

    loadPermissions(): Observable<PermissionEntity[]> {
        return this.bakeryManagementApiService.getPermissions().pipe(
            tap((permissions) => this.permissionsSubject.next(permissions)),
            catchError((error) => {
                return throwError(() => error)
            })
        )
    }

    createPermission(
        payload: CreatePermissionRequest | CreatePermissionRequest[]
    ): Observable<PermissionEntity | PermissionEntity[]> {
        return this.bakeryManagementApiService.createPermission(payload).pipe(
            tap((result) => {
                const current = this.permissionsSubject.getValue()
                if (Array.isArray(result)) {
                    this.permissionsSubject.next([...result, ...current])
                } else {
                    this.permissionsSubject.next([result, ...current])
                }
            }),
            catchError((error) => {
                return throwError(() => error)
            })
        )
    }

    loadRolePermissions(): Observable<RolePermissionsSummary[]> {
        return this.bakeryManagementApiService.getRolePermissions().pipe(
            tap((roles: RolePermissionsSummary[]) => this.rolePermissionsSubject.next(roles)),
            catchError((error) => {
                return throwError(() => error)
            })
        )
    }

    assignPermissionsToRole(
        roleId: number,
        permissionCodes: AssignPermissionsRequest['permissionCodes']
    ): Observable<PermissionEntity[]> {
        return this.bakeryManagementApiService
            .assignPermissionsToRole(roleId, {
                permissionCodes,
            })
            .pipe(
                tap((updatedPermissions) => {
                    const currentRoles = this.rolePermissionsSubject.getValue()
                    const roleIndex = currentRoles.findIndex((role) => role.id === roleId)

                    if (roleIndex === -1) {
                        return
                    }

                    const updatedRole: RolePermissionsSummary = {
                        ...currentRoles[roleIndex],
                        permissionCodes: updatedPermissions.map((permission) => permission.code),
                    }

                    const nextRoles = [...currentRoles]
                    nextRoles[roleIndex] = updatedRole
                    this.rolePermissionsSubject.next(nextRoles)
                }),
                catchError((error) => {
                    return throwError(() => error)
                })
            )
    }
}
