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

import { TranslocoDirective } from '@jsverse/transloco'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { UserEntity } from 'src/app/shared/models/user.model'
import { TableComponent } from 'src/app/shared/components/table/table.component'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { CreateUpdateUserDialogComponent } from 'src/app/shared/components/create-update-user-dialog/create-update-user-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private bakeryManagementApiService = inject(BakeryManagementApiService);
  private dialog = inject(MatDialog);

  public tableColumns = signal([
    { key: "first_name", label: "manageUsers.first_name" },
    { key: "role", label: "manageUsers.role" },
    { key: "phone_number", label: "manageUsers.phone_number" },
  ]);
  public searchQuery = signal('');
  public searchOptions = signal<SearchOptions>({ title: true, all: false });
  public tableData$!: Observable<UserEntity[]>;
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
      map(response => response.users)
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
        maxHeight: '80%',
    })
  }

  public onEdit(user: UserEntity): void {
    this.dialog.open(CreateUpdateUserDialogComponent, {
        width: '100vh',
        maxHeight: '80%',
        data: { user }
    })
  }

  public onDelete(user: UserEntity): void {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '80%',
      maxHeight: '40%',
    })
  }

  public onPageInfoChange(pageInfo: { currentPage: number; pageSize: number }): void {
    this.currentPage.set(pageInfo.currentPage);
    this.pageSize.set(pageInfo.pageSize);
    this.findAll();
  }
}
