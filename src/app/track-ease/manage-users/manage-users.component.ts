import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import {
    MatTableDataSource,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
} from '@angular/material/table'
import { UserEntity } from 'src/app/shared/models/user.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { DropdownEvent, DropdownMenuListItem } from 'src/app/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/app/shared/models/actionOptions'
import { Subject, map, take, takeUntil } from 'rxjs'
import { SearchService } from 'src/app/services/search.service'
import { NgTemplateOutlet, NgIf } from '@angular/common'
import { MatButton } from '@angular/material/button'
import { MatMenuTrigger } from '@angular/material/menu'
import { MatIcon } from '@angular/material/icon'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { TopBarComponent } from '../../shared/components/top-bar/top-bar.component'
import { CreateUpdateUserDialogComponent } from '../../shared/components/create-update-user-dialog/create-update-user-dialog.component'
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component'
import { DropdownMenuListComponent } from '../../shared/components/dropdown-menu-list/dropdown-menu-list.component'

@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.scss'],
    standalone: true,
    imports: [
        NgTemplateOutlet,
        MatTable,
        MatColumnDef,
        MatHeaderCellDef,
        MatHeaderCell,
        MatCellDef,
        MatCell,
        MatButton,
        MatMenuTrigger,
        MatIcon,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MatNoDataRow,
        NgIf,
        MatProgressSpinner,
        MatPaginator,
        TopBarComponent,
        CreateUpdateUserDialogComponent,        
        ConfirmationDialogComponent,
        DropdownMenuListComponent,
    ],
})
export class ManageUsersComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild('createUpdateContainer')
    createUpdateContainer!: TemplateRef<CreateUpdateUserDialogComponent>
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

    private destroy$ = new Subject<void>()

    displayedColumns: string[] = ['first_name', 'role', 'phone_number', 'actions']
    activeUser: UserEntity | null = null
    actionState: 'create' | 'update' = 'create'

    dataSource: MatTableDataSource<UserEntity> = new MatTableDataSource<UserEntity>([])
    isLoading = false

    actionDropdown: DropdownMenuListItem[] = [
        {
            label: DropdownActionOptions.EDIT,
            icon: 'edit',
        },
        {
            label: DropdownActionOptions.DELETE,
            icon: 'delete',
        },
    ]

    constructor(
        public bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        private searchService: SearchService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.bakeryManagementService.activeTab = 'users'
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    ngAfterViewInit() {
        this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe((event: PageEvent) => {
            const pageSizeChanged = this.bakeryManagementService.navigationContext.pagination.limit !== event.pageSize;

            this.bakeryManagementService.navigationContext.pagination.limit = event.pageSize;
            this.bakeryManagementService.navigationContext.pagination.offset = event.pageIndex * event.pageSize;
            if (event.pageIndex > event.previousPageIndex!) {
                this.getUsersList(true);
            }
            if (pageSizeChanged) {
                this.getUsersList(false);
            }
        });

        this.getUsersList(false)
    }
    
    getUsersList(append: boolean) {
        this.isLoading = true
        this.bakeryManagementService.updateUsersList(append).subscribe({
            next: () => {
                this.isLoading = false
                this.bakeryManagementService.usersList$.subscribe((users) => {
                    this.dataSource.data = users
                })
            },
            error: (error: any) => {
                this.isLoading = false
                console.log('Error: ', error)
            },
        })
    }

    onDropdownMenuClick(item: DropdownEvent): void {
        const { option } = item
        switch (option.label) {
            case DropdownActionOptions.EDIT:
                this.actionState = 'update'
                this.openCreateUpdateUser()
                break
            case DropdownActionOptions.DELETE:
                this.deleteUser()
                break
            default:
                break
        }
    }

    addUser(): void {
        this.actionState = 'create'
        this.activeUser = null
        this.openCreateUpdateUser()
    }

    openCreateUpdateUser(): void {
        this.dialog.open(this.createUpdateContainer, {
            width: '100vh',
            maxHeight: '80%',
        })
    }

    deleteUser(): void {
        if (!this.activeUser) {
            return
        }
        this.dialog.open(this.confirmationDialogContainer, {
            width: '80%',
            maxHeight: '40%',
        })
    }

    onDeleteUser(): void {
        this.dialog.closeAll()
        if (!this.activeUser) {
            return
        }

        const userId = this.activeUser.id

        this.bakeryManagementApiService.deleteUser(userId).subscribe({
            next: () => {
                this.bakeryManagementService.usersList$
                    .pipe(
                        take(1),
                        map((user: UserEntity[]) => {
                            return user.filter((user) => user.id !== userId)
                        })
                    )
                    .subscribe((users) => {
                        this.dataSource.data = users
                        this.activeUser = null
                    })
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    selectUser(user: UserEntity) {
        this.activeUser = user
    }

    getSearchOptions(): SearchOptions {
        return this.searchService.getSearchOptions()
    }

    setSearchQuery(data: string) {
        this.bakeryManagementService.setSearchQuery(data)
    }

    setSearchOptions(searchOptions: SearchOptions) {
        this.searchService.setSearchOptions(searchOptions)
    }
}
