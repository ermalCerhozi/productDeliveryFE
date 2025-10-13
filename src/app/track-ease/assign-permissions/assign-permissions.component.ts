import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    inject,
} from '@angular/core'
import { CommonModule } from '@angular/common'

import { Subject, forkJoin, of } from 'rxjs'
import { finalize, takeUntil, catchError, map, take } from 'rxjs/operators'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { TranslocoService } from '@jsverse/transloco'
import { isEqual } from 'lodash-es'

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
        MatToolbarModule,
        MatButtonModule,
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
    roleColumns: Array<{
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
    isSaving = false
    hasPendingChanges = false

    private destroy$ = new Subject<void>()
    private roleIdByName = new Map<RoleName, number>()
    private roleSelectionByRoleId = new Map<number, Set<string>>()
    private originalRoleSelectionByRoleId = new Map<number, Set<string>>()

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

        const currentSelection = new Set(this.roleSelectionByRoleId.get(roleId) ?? [])

        if (checked) {
            currentSelection.add(permissionCode)
        } else {
            currentSelection.delete(permissionCode)
        }

        this.roleSelectionByRoleId.set(roleId, currentSelection)
        this.detectChanges()
        this.cdr.markForCheck()
    }

    onSaveChanges(): void {
        if (this.isSaving || !this.hasPendingChanges) {
            return
        }

        this.isSaving = true
        this.cdr.markForCheck()

        const saveRequests = Array.from(this.roleSelectionByRoleId.entries())
            .filter(([roleId, currentPermissions]) => {
                const originalPermissions = this.originalRoleSelectionByRoleId.get(roleId)
                if (!originalPermissions) {
                    return false
                }
                // Check if this role has changes
                return !isEqual(
                    Array.from(currentPermissions).sort(),
                    Array.from(originalPermissions).sort()
                )
            })
            .map(([roleId, permissions]) =>
                this.permissionsService.assignPermissionsToRole(roleId, Array.from(permissions)).pipe(
                    take(1),  // Add this
                    map(() => ({ success: true, roleId })),
                    catchError((error: unknown) => {
                        console.error(`Failed to update role ${roleId}:`, error)
                        return of({ success: false, roleId, error })
                    })
                )
)


        if (saveRequests.length === 0) {
            this.isSaving = false
            this.hasPendingChanges = false
            this.cdr.markForCheck()
            return
        }

        forkJoin(saveRequests)
            .pipe(
                finalize(() => {
                    this.isSaving = false
                    this.cdr.markForCheck()
                })
            )
            .subscribe({
                next: (results) => {
                    const failures = results.filter((r: any) => r?.success === false)

                    if (failures.length === 0) {
                        // All successful - update original state
                        this.originalRoleSelectionByRoleId = new Map(
                            Array.from(this.roleSelectionByRoleId.entries()).map(
                                ([roleId, permissions]) => [roleId, new Set(permissions)]
                            )
                        )
                        this.hasPendingChanges = false
                        this.snackBar.open(
                            this.translocoService.translate(
                                'managePermissions.permissionsUpdated'
                            ) as string,
                            this.translocoService.translate('managePermissions.dismiss') as string,
                            {
                                duration: 2000,
                            }
                        )
                    } else {
                        // Some failed - revert failed ones and show error
                        failures.forEach((failure: any) => {
                            const originalPermissions = this.originalRoleSelectionByRoleId.get(failure.roleId)
                            if (originalPermissions) {
                                this.roleSelectionByRoleId.set(failure.roleId, new Set(originalPermissions))
                            }
                        })
                        this.detectChanges()
                        this.snackBar.open(
                            `Failed to update ${failures.length} role(s). Please try again.`,
                            'Dismiss',
                            {
                                duration: 4000,
                            }
                        )
                    }
                    this.cdr.markForCheck()
                },
                error: (error: unknown) => {
                    const apiError = error as { error?: { message?: string } }
                    const message =
                        apiError?.error?.message ??
                        'Failed to update permissions. Please try again.'
                    this.snackBar.open(message, 'Dismiss', {
                        duration: 4000,
                    })
                    this.cdr.markForCheck()
                },
            })
    }

    onCancelChanges(): void {
        // Revert all changes to original state
        this.roleSelectionByRoleId = new Map(
            Array.from(this.originalRoleSelectionByRoleId.entries()).map(
                ([roleId, permissions]) => [roleId, new Set(permissions)]
            )
        )
        this.hasPendingChanges = false
        this.cdr.markForCheck()
    }

    private detectChanges(): void {
        // Compare current state with original state using lodash isEqual
        let hasChanges = false

        for (const [roleId, currentPermissions] of this.roleSelectionByRoleId.entries()) {
            const originalPermissions = this.originalRoleSelectionByRoleId.get(roleId)
            if (!originalPermissions) {
                continue
            }

            const currentSorted = Array.from(currentPermissions).sort()
            const originalSorted = Array.from(originalPermissions).sort()

            if (!isEqual(currentSorted, originalSorted)) {
                hasChanges = true
                break
            }
        }

        this.hasPendingChanges = hasChanges
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
        this.originalRoleSelectionByRoleId = new Map<number, Set<string>>()

        roles.forEach((role) => {
            this.roleIdByName.set(role.name, role.id)
            const permissions = new Set(role.permissionCodes ?? [])
            this.roleSelectionByRoleId.set(role.id, new Set(permissions))
            this.originalRoleSelectionByRoleId.set(role.id, new Set(permissions))
        })

        this.hasPendingChanges = false
        this.cdr.markForCheck()
    }
}
