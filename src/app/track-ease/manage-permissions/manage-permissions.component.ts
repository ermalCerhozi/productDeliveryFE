import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'

import { Subject } from 'rxjs'
import { finalize, takeUntil } from 'rxjs/operators'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'

import { PermissionsService } from 'src/app/services/permissions.service'
import {
    CreatePermissionRequest,
    PermissionEntity,
    RoleName,
    RolePermissionsSummary,
} from 'src/app/shared/models/permission.model'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { TopBarComponent } from '../../shared/components/top-bar/top-bar.component'

@Component({
    selector: 'app-manage-permissions',
    templateUrl: './manage-permissions.component.html',
    styleUrls: ['./manage-permissions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatCheckboxModule,
        MatPaginatorModule,
        TopBarComponent,
    ],
})
export class ManagePermissionsComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    readonly permissions$ = this.permissionsService.permissions$
    readonly rolePermissions$ = this.permissionsService.rolePermissions$
    readonly displayedColumns = ['code', 'description', 'updated_at']
    readonly assignmentColumns = ['code', 'Admin', 'Seller', 'Client']
    readonly roleColumns: ReadonlyArray<{
        label: string
        columnKey: RoleName
    }> = [
        { label: 'Admin', columnKey: 'Admin' },
        { label: 'Seller', columnKey: 'Seller' },
        { label: 'Client', columnKey: 'Client' },
    ]

    isLoading = false
    isSubmitting = false
    errorMessage: string | null = null
    isRoleAssignmentsLoading = false

    readonly dataSource = new MatTableDataSource<PermissionEntity>([])
    totalPermissions = 0
    searchQuery = ''
    searchOptions: SearchOptions = { title: true, all: false }

    @ViewChild(MatPaginator) paginator?: MatPaginator

    private readonly destroy$ = new Subject<void>()
    private roleIdByName = new Map<RoleName, number>()
    private roleSelectionByRoleId = new Map<number, Set<string>>()
    private assigningRoleIds = new Set<number>()

    readonly form = this.fb.group({
        code: ['', [Validators.required, Validators.maxLength(50)]],
        description: ['', [Validators.maxLength(255)]],
    })

    constructor(
        private readonly fb: FormBuilder,
        private readonly permissionsService: PermissionsService,
        private readonly snackBar: MatSnackBar,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.loadPermissions()
        this.loadRoleAssignments()

        this.dataSource.filterPredicate = (
            permission: PermissionEntity,
            filterValue: string,
        ) => {
            if (!filterValue) {
                return true
            }

            let criteria: { query: string; mode: 'title' | 'all' }
            try {
                criteria = JSON.parse(filterValue)
            } catch {
                criteria = { query: filterValue, mode: 'all' }
            }

            const normalizedFilter = (criteria.query ?? '').trim().toLowerCase()
            if (!normalizedFilter) {
                return true
            }

            if (criteria.mode === 'title') {
                return permission.code.toLowerCase().includes(normalizedFilter)
            }

            const target = `${permission.code} ${permission.description ?? ''}`
                .toLowerCase()
                .trim()

            return target.includes(normalizedFilter)
        }

        this.permissions$
            .pipe(takeUntil(this.destroy$))
            .subscribe((permissions: PermissionEntity[]) => {
                this.totalPermissions = permissions.length
                this.dataSource.data = permissions
                this.applyFilter()
                this.cdr.markForCheck()
            })

        this.rolePermissions$
            .pipe(takeUntil(this.destroy$))
            .subscribe((roles: RolePermissionsSummary[]) => {
                this.syncRoleAssignments(roles)
            })
    }

    ngAfterViewInit(): void {
        if (this.paginator) {
            this.dataSource.paginator = this.paginator
            this.cdr.markForCheck()
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }

    onSubmit(): void {
        if (this.form.invalid || this.isSubmitting) {
            this.form.markAllAsTouched()
            return
        }

        const formValue = this.form.value
        const payload: CreatePermissionRequest = {
            code: formValue.code?.trim() ?? '',
            description: formValue.description?.trim() || null,
        }

        if (!payload.code) {
            this.form.get('code')?.setErrors({ required: true })
            return
        }

        this.isSubmitting = true
        this.errorMessage = null
        this.permissionsService
            .createPermission(payload)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false
                    this.cdr.markForCheck()
                }),
            )
            .subscribe({
                next: () => {
                    this.form.reset()
                    this.snackBar.open('Permission created successfully', 'Dismiss', {
                        duration: 2500,
                    })
                },
                error: (error) => {
                    const message =
                        error?.error?.message ?? 'Failed to create permission. Please try again.'
                    this.errorMessage = message
                    this.snackBar.open(message, 'Dismiss', {
                        duration: 4000,
                    })
                },
            })
    }

    trackByPermissionId(_: number, permission: PermissionEntity): number {
        return permission.id
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

    onPermissionToggle(
        roleName: RoleName,
        permissionCode: string,
        checked: boolean,
    ): void {
        const roleId = this.roleIdByName.get(roleName)
        if (roleId === undefined) {
            this.snackBar.open('Selected role is not available', 'Dismiss', {
                duration: 3000,
            })
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
                }),
            )
            .subscribe({
                next: () => {
                    this.snackBar.open('Permissions updated', 'Dismiss', {
                        duration: 2000,
                    })
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

    private loadPermissions(): void {
        this.isLoading = true
        this.permissionsService
            .loadPermissions()
            .pipe(
                finalize(() => {
                    this.isLoading = false
                    this.cdr.markForCheck()
                }),
            )
            .subscribe({
                error: (error) => {
                    const message =
                        error?.error?.message ?? 'Failed to load permissions. Please refresh.'
                    this.errorMessage = message
                    this.snackBar.open(message, 'Dismiss', {
                        duration: 4000,
                    })
                },
            })
    }

    setSearchQuery(query: string): void {
        this.searchQuery = query ?? ''
        this.applyFilter()
    }

    setSearchOptions(options: SearchOptions): void {
        this.searchOptions = { ...options }
        this.applyFilter()
    }

    getSearchOptions(): SearchOptions {
        return this.searchOptions
    }

    private applyFilter(): void {
        const normalizedValue = this.searchQuery.trim().toLowerCase()
        const mode = this.searchOptions.title ? 'title' : 'all'
        this.dataSource.filter = JSON.stringify({ query: normalizedValue, mode })
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
        this.cdr.markForCheck()
    }

    private loadRoleAssignments(): void {
        this.isRoleAssignmentsLoading = true
        this.permissionsService
            .loadRolePermissions()
            .pipe(
                finalize(() => {
                    this.isRoleAssignmentsLoading = false
                    this.cdr.markForCheck()
                }),
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
            this.roleSelectionByRoleId.set(
                role.id,
                new Set(role.permissionCodes ?? []),
            )
        })

        this.cdr.markForCheck()
    }
}
