import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/app/shared/components/create-update-dialog/create-update-dialog.component'
import { UserEntity } from 'src/app/shared/models/user.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { DropdownEvent, DropdownMenuListItem } from 'src/app/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/app/shared/models/actionOptions'
import { Subject, map, take } from 'rxjs'
import { SearchService } from 'src/app/services/search.service'

@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit, AfterViewInit, OnDestroy {
    unsubscribe = new Subject<void>()
    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild('createUpdateContainer')
    createUpdateContainer!: TemplateRef<CreateUpdateDialogComponent>
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

    displayedColumns: string[] = ['first_name', 'role', 'phone_number', 'actions']
    activeUser!: UserEntity
    actionState!: string

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
        this.getUsersList(false)
        this.bakeryManagementService.activeTab = 'users'
    }

    ngOnDestroy() {
        this.unsubscribe.next()
        this.unsubscribe.complete()
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
        this.openCreateUpdateUser()
    }

    openCreateUpdateUser(): void {
        this.dialog.open(this.createUpdateContainer, {
            width: '100%',
            maxHeight: '80%',
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
