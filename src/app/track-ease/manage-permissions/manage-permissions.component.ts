import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { finalize } from 'rxjs/operators'
import { PermissionsService } from 'src/app/services/permissions.service'
import {
    CreatePermissionRequest,
    PermissionEntity,
} from 'src/app/shared/models/permission.model'

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
    ],
})
export class ManagePermissionsComponent implements OnInit {
    readonly permissions$ = this.permissionsService.permissions$
    readonly displayedColumns = ['code', 'description', 'updated_at']

    isLoading = false
    isSubmitting = false
    errorMessage: string | null = null

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
}
