import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ConfirmationDialogComponent } from 'src/shared/components/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/shared/components/create-update-dialog/create-update-dialog.component'
import { UserEntity } from 'src/shared/models/user.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { SearchOptions } from 'src/shared/models/navigation-context.model'
import { DropdownEvent, DropdownMenuListItem } from 'src/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/shared/models/actionOptions'
import { map, take } from 'rxjs'

@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['first_name', 'role', 'phone_number', 'actions']
    activeUser!: UserEntity
    actionState!: string

    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild('createUpdateContainer')
    createUpdateContainer!: TemplateRef<CreateUpdateDialogComponent>
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>
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
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.getUsersList(false)
        this.bakeryManagementService.activeTab = 'users'
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator
        this.paginator.page.subscribe((event) => {
            if (event.pageIndex > event.previousPageIndex!) {
                this.getUsersList(true)
            }
        })
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

    onDropdownMenuClick(item: DropdownEvent, product: UserEntity): void {
        this.activeUser = product
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
        this.openCreateUpdateUser()
    }

    openCreateUpdateUser(): void {
        this.dialog.open(this.createUpdateContainer, {
            width: '100%',
            maxHeight: '80%',
        })
    }

    openFilterUsersDialog(): void {
        const dialogRef = this.dialog.open(FilterDialogComponent)
        dialogRef.afterClosed().subscribe({
            next: (result) => {
                if (result) {
                    // this.bakeryManagementService.getFilteredResults(result)
                }
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    createUser(user: UserEntity) {
        this.dialog.closeAll()
        this.bakeryManagementApiService.createUser(user).subscribe({
            next: (res) => {
                this.bakeryManagementService.usersList$
                    .pipe(
                        take(1),
                        map((users: UserEntity[]) => {
                            users.unshift(res)
                            return users
                        })
                    )
                    .subscribe((users) => {
                        this.dataSource.data = users
                    })
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    updateUser(user: UserEntity) {
        this.dialog.closeAll()
        this.bakeryManagementApiService.updateUser(this.activeUser, user).subscribe({
            next: (res) => {
                this.bakeryManagementService.usersList$
                    .pipe(
                        take(1),
                        map((users: UserEntity[]) => {
                            const index = users.findIndex((p) => p.id === res.id)
                            if (index > -1) {
                                console.log('index: ', index)
                                users[index] = res
                            }
                            return users
                        })
                    )
                    .subscribe((users) => {
                        this.dataSource.data = users
                    })
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    deleteUser(): void {
        this.dialog.open(this.confirmationDialogContainer, {
            width: '80%',
            maxHeight: '40%',
        })
    }

    onDeleteUser(): void {
        this.bakeryManagementApiService.deleteProduct(this.activeUser.id).subscribe({
            next: () => {
                this.bakeryManagementService.usersList$
                    .pipe(
                        take(1),
                        map((user: UserEntity[]) => {
                            return user.filter((user) => user.id !== this.activeUser.id)
                        })
                    )
                    .subscribe((users) => {
                        this.dataSource.data = users
                    })
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    applySearch(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }

    getSearchOptions(): SearchOptions {
        return this.bakeryManagementService.getSearchOptions()
    }

    setSearchQuery(data: string) {
        if (data !== this.bakeryManagementService.navigationContext.filters.queryString) {
            this.bakeryManagementService.navigationContext.filters.queryString = data
            this.bakeryManagementService.navigationContext.getCount = true
            this.bakeryManagementService.updateUsersList(false).subscribe()
        }
    }

    setSearchOptions(searchOptions: SearchOptions) {
        this.bakeryManagementService.setSearchOptions(searchOptions)
    }
}
