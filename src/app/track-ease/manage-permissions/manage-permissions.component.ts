import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms'

import { Observable } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatDialog } from '@angular/material/dialog'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco'

import { PermissionsService } from 'src/app/services/permissions.service'
import {
  CreatePermissionRequest,
  PermissionEntity,
} from 'src/app/shared/models/permission.model'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { TopBarComponent } from '../../shared/components/top-bar/top-bar.component'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { AssignPermissionsComponent } from '../assign-permissions/assign-permissions.component'
import { TableComponent } from "src/app/shared/components/table/table.component";

@Component({
  selector: 'app-manage-permissions',
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    AssignPermissionsComponent,
    TableComponent,
    MatCardModule,
    TranslocoDirective,
  ],
})
export class ManagePermissionsComponent {
  @ViewChild('formDirective') private formDirective!: FormGroupDirective;

  private destroyRef = inject(DestroyRef);
  private permissionsService = inject(PermissionsService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private translocoService = inject(TranslocoService);

  public tableColumns = signal([
    { key: "code", label: "managePermissions.code" },
    { key: "description", label: "managePermissions.description" },
  ]);
  public searchQuery = signal('');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(255)]],
  })

  public searchOptions = signal<SearchOptions>({ title: true, all: false });
  public tableData$!: Observable<PermissionEntity[]>;
  public currentPage = signal(1);
  public pageSize = signal(10);

  ngOnInit(): void {
    this.findAll();
  }

  onSubmit(): void {
    if (this.form.invalid) {
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

    this.permissionsService
      .createPermission(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.translocoService.translate('managePermissions.permissionCreatedSuccess'),
            this.translocoService.translate('managePermissions.dismiss'),
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            }
          )
          this.formDirective.resetForm()
          this.form.reset()
          this.findAll()
        },
        error: (error) => {
          const errorMessage = error?.error?.message || this.translocoService.translate('managePermissions.permissionCreatedError')
          this.snackBar.open(errorMessage, this.translocoService.translate('managePermissions.dismiss'), {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          })
        },
      })
  }

  public findAll(): void {
    this.permissionsService.loadPermissions().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        // Permissions are now loaded and available in permissions$
      },
      error: (error) => {
        this.snackBar.open(
          this.translocoService.translate('managePermissions.failedToLoadPermissions'),
          this.translocoService.translate('managePermissions.dismiss'),
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          }
        )
      },
    });

    this.tableData$ = this.permissionsService.permissions$;
  }

  public onSearch(query: string): void {
    this.searchQuery.set(query.toLowerCase());
    // Filter permissions locally based on search query
    if (query.trim()) {
      this.tableData$ = new Observable<PermissionEntity[]>((observer) => {
        this.permissionsService.permissions$.pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe((permissions) => {
          const filtered = permissions.filter(p =>
            p.code.toLowerCase().includes(query.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
          );
          observer.next(filtered);
        });
      });
    } else {
      this.tableData$ = this.permissionsService.permissions$;
    }
  }

  public onOptionsChanged(options: SearchOptions): void {
    this.searchOptions.set(options);
    this.findAll();
  }

  public addPermission(): void {
    // TODO: Implement add permission dialog
    console.log('Add permission');
  }

  public onEdit(permission: PermissionEntity): void {
    // TODO: Implement edit permission dialog and API endpoint in backend
    this.snackBar.open(
      this.translocoService.translate('managePermissions.editNotImplemented'),
      this.translocoService.translate('managePermissions.dismiss'),
      {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      }
    )
    console.log('Edit permission', permission);
  }

  public onDelete(permission: PermissionEntity): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: this.translocoService.translate('managePermissions.deletePermissionTitle'),
        message: this.translocoService.translate('managePermissions.deletePermissionMessage', { code: permission.code }),
      },
    })

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (confirmed) {
        this.permissionsService
          .deletePermission(permission.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open(
                this.translocoService.translate('managePermissions.permissionDeletedSuccess'),
                this.translocoService.translate('managePermissions.dismiss'),
                {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                }
              )
            },
            error: (error) => {
              const errorMessage = error?.error?.message || this.translocoService.translate('managePermissions.permissionDeletedError')
              this.snackBar.open(errorMessage, this.translocoService.translate('managePermissions.dismiss'), {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
              })
            },
          })
      }
    })
  }

  public onPageInfoChange(pageInfo: { currentPage: number; pageSize: number }): void {
    this.currentPage.set(pageInfo.currentPage);
    this.pageSize.set(pageInfo.pageSize);
    this.findAll();
  }
}
