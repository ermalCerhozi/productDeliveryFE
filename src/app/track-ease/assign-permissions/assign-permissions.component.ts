import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    inject,
} from '@angular/core'
import { CommonModule } from '@angular/common'

import { Subject } from 'rxjs'
import { finalize, takeUntil } from 'rxjs/operators'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { TranslocoService } from '@jsverse/transloco'

import { PermissionsService } from 'src/app/services/permissions.service'
import {
    RoleName,
    RolePermissionsSummary,
} from 'src/app/shared/models/permission.model'

@Component({
    selector: 'app-assign-permissions',
    templateUrl: './assign-permissions.component.html',
    styleUrls: ['./assign-permissions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatCheckboxModule,
        MatSnackBarModule,
    ],
})
export class AssignPermissionsComponent implements OnInit, OnDestroy {
    private permissionsService = inject(PermissionsService)
    private snackBar = inject(MatSnackBar)
    private cdr = inject(ChangeDetectorRef)
    private translocoService = inject(TranslocoService)

    permissions$ = this.permissionsService.permissions$
    rolePermissions$ = this.permissionsService.rolePermissions$
    assignmentColumns = ['code', 'Admin', 'Seller', 'Client']
    roleColumns:Array<{
        label: string
        columnKey: RoleName
    }> = [
        {
            label: this.translocoService.translate('managePermissions.roleAdmin') as string,
            columnKey: 'Admin',
        },
        {
            label: this.translocoService.translate('managePermissions.roleSeller') as string,
            columnKey: 'Seller',
        },
        {
            label: this.translocoService.translate('managePermissions.roleClient') as string,
            columnKey: 'Client',
        },
    ]

    isRoleAssignmentsLoading = false

    private destroy$ = new Subject<void>()
    private roleIdByName = new Map<RoleName, number>()
    private roleSelectionByRoleId = new Map<number, Set<string>>()
    private assigningRoleIds = new Set<number>()

    ngOnInit(): void {
        this.loadRoleAssignments()

        this.rolePermissions$
            .pipe(takeUntil(this.destroy$))
            .subscribe((roles: RolePermissionsSummary[]) => {
                this.syncRoleAssignments(roles)
            })
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }

    isPermissionAssigned(roleName: RoleName, permissionCode: string): boolean {
        const roleId = this.roleIdByName.get(roleName)
        if (roleId === undefined) {
            return false
        }

        return this.roleSelectionByRoleId.get(roleId)?.has(permissionCode) ?? false
    }

    hasRole(roleName: RoleName): boolean {
        return this.roleIdByName.has(roleName)
    }

    isRoleAssigning(roleName: RoleName): boolean {
        const roleId = this.roleIdByName.get(roleName)
        if (roleId === undefined) {
            return false
        }

        return this.assigningRoleIds.has(roleId)
    }

    onPermissionToggle(roleName: RoleName, permissionCode: string, checked: boolean): void {
        const roleId = this.roleIdByName.get(roleName)
        if (roleId === undefined) {
            this.snackBar.open(
                this.translocoService.translate('managePermissions.roleNotAvailable') as string,
                this.translocoService.translate('managePermissions.dismiss') as string,
                {
                    duration: 3000,
                }
            )
            return
        }

        const previousSelection = new Set(this.roleSelectionByRoleId.get(roleId) ?? [])
        const nextSelection = new Set(previousSelection)

        if (checked) {
            nextSelection.add(permissionCode)
        } else {
            nextSelection.delete(permissionCode)
        }

        this.roleSelectionByRoleId.set(roleId, nextSelection)
        this.assigningRoleIds.add(roleId)
        this.cdr.markForCheck()

        this.permissionsService
            .assignPermissionsToRole(roleId, Array.from(nextSelection))
            .pipe(
                finalize(() => {
                    this.assigningRoleIds.delete(roleId)
                    this.cdr.markForCheck()
                })
            )
            .subscribe({
                next: () => {
                    this.snackBar.open(
                        this.translocoService.translate(
                            'managePermissions.permissionsUpdated'
                        ) as string,
                        this.translocoService.translate('managePermissions.dismiss') as string,
                        {
                            duration: 2000,
                        }
                    )
                },
                error: (error: unknown) => {
                    this.roleSelectionByRoleId.set(roleId, previousSelection)
                    this.cdr.markForCheck()

                    const apiError = error as { error?: { message?: string } }
                    const message =
                        apiError?.error?.message ??
                        'Failed to update permissions. Please try again.'
                    this.snackBar.open(message, 'Dismiss', {
                        duration: 4000,
                    })
                },
            })
    }

    private loadRoleAssignments(): void {
        this.isRoleAssignmentsLoading = true
        this.permissionsService
            .loadRolePermissions()
            .pipe(
                finalize(() => {
                    this.isRoleAssignmentsLoading = false
                    this.cdr.markForCheck()
                })
            )
            .subscribe({
                error: (error: unknown) => {
                    const apiError = error as { error?: { message?: string } }
                    const message =
                        apiError?.error?.message ??
                        'Failed to load role permissions. Please refresh.'
                    this.snackBar.open(message, 'Dismiss', {
                        duration: 4000,
                    })
                },
            })
    }

    private syncRoleAssignments(roles: RolePermissionsSummary[]): void {
        this.roleIdByName = new Map<RoleName, number>()
        this.roleSelectionByRoleId = new Map<number, Set<string>>()

        roles.forEach((role) => {
            this.roleIdByName.set(role.name, role.id)
            this.roleSelectionByRoleId.set(role.id, new Set(role.permissionCodes ?? []))
        })

        this.cdr.markForCheck()
    }
}
