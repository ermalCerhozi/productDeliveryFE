import {
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
} from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

import { MatDialog } from '@angular/material/dialog'
import { TranslocoService } from '@jsverse/transloco'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { UserEntity } from 'src/app/shared/models/user.model'
import { TableComponent } from 'src/app/shared/components/table/table.component'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { CreateUpdateUserDialogComponent } from 'src/app/shared/components/create-update-user-dialog/create-update-user-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
  imports: [
    AsyncPipe,
    TableComponent,
    TopBarComponent,
  ],
})
export class ManageUsersComponent implements OnInit {
  private translocoService = inject(TranslocoService)
  private destroyRef = inject(DestroyRef);
  private bakeryManagementApiService = inject(BakeryManagementApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  public tableColumns = signal([
    { key: "first_name", label: "manageUsers.first_name" },
    { key: "role", label: "manageUsers.role" },
    { key: "phone_number", label: "manageUsers.phone_number" },
  ]);
  public searchQuery = signal('');
  public searchOptions = signal<SearchOptions>({ title: true, all: false });
  public tableData$!: Observable<UserEntity[]>;
  public totalCount = signal(0);
  public currentPage = signal(1);
  public pageSize = signal(10);

  ngOnInit(): void {
    this.findAll();
  }

  public findAll(): void {
    this.tableData$ = this.bakeryManagementApiService.searchUsers(
      this.searchQuery(),
      this.currentPage(),
      this.pageSize(),
      this.searchOptions()
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(response => {
        this.totalCount.set(response.count);
        return response.users;
      }),
    );
  }

  public onSearch(query: string): void {
    this.searchQuery.set(query.toLowerCase());
    this.findAll();
  }

  public onOptionsChanged(options: SearchOptions): void {
    this.searchOptions.set(options);
    this.findAll();
  }

  public addUser(): void {
    this.dialog.open(CreateUpdateUserDialogComponent, {
      width: '100vh',
      maxHeight: '90vh',
      autoFocus: false
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.findAll();
      });
  }

  public onEdit(user: UserEntity): void {
    this.dialog.open(CreateUpdateUserDialogComponent, {
      width: '100vh',
      maxHeight: '90vh',
      autoFocus: false,
      data: { user }
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.findAll();
      });
  }


  public onDelete(user: UserEntity): void {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '80%',
      maxHeight: '40%',
      data: {
        title: this.translocoService.translate('manageUsers.deleteTitle'),
        message: this.translocoService.translate('manageUsers.deleteMessage', { name: user.first_name }),
        displayOkButton: true,
        displayCancelButton: true
      }
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.bakeryManagementApiService.deleteUser(user.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open(
                this.translocoService.translate('manageUsers.deleteSuccess'),
                this.translocoService.translate('manageUsers.deleteSuccess'),
                {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                  panelClass: ['snack-bar-success'],
                }
              )
              this.findAll();
            },
            error: (error) => {
              const errorMessage = error?.error?.message || this.translocoService.translate('manageUsers.deleteError')
              this.snackBar.open(errorMessage, this.translocoService.translate('manageUsers.deleteError'), {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['snack-bar-error'],
              })
            }
          });
      }
    });
  }

  public onPageInfoChange(pageInfo: { currentPage: number; pageSize: number }): void {
    this.currentPage.set(pageInfo.currentPage + 1);
    this.pageSize.set(pageInfo.pageSize);
    this.findAll();
  }
}
