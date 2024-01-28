import { Component, OnInit, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { UserEntity } from 'src/shared/models/user.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
import { BakeryManagementService } from 'src/services/bakery-management.service'
/**
 * @title Data table with pagination, and filtering.
 */
@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.css'],
})
export class ManageUsersComponent implements OnInit {
    displayedColumns: string[] = ['id', 'first_name', 'role', 'phone_number', 'actions']
    dataSource: MatTableDataSource<UserEntity> = new MatTableDataSource<UserEntity>([])

    @ViewChild(MatPaginator) paginator!: MatPaginator

    constructor(
        private bakeryManagementService: BakeryManagementService,
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getUsers()
    }

    getUsers() {
        this.bakeryManagementApiService.getUsers().subscribe((res) => {
            const users: UserEntity[] = res
            this.dataSource = new MatTableDataSource(users)
            this.dataSource.paginator = this.paginator
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

    createUpdateUser(action: string, user?: UserEntity): void {
        const dialogRef = this.dialog.open(CreateUpdateDialogComponent, {
            width: '80%',
            height: '80%',
            data: { action, type: 'user', user },
        })

        dialogRef.afterClosed().subscribe({
            next: (result: UserEntity) => {
                if (result) {
                    if (action === 'create') {
                        this.bakeryManagementApiService.createUser(result).subscribe({
                            next: () => {
                                this.getUsers()
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    } else if (action === 'update') {
                        this.bakeryManagementApiService.updateUser(user!, result).subscribe({
                            next: () => {
                                this.getUsers()
                            },
                            error: (error) => {
                                console.log('Error: ', error)
                            },
                        })
                    }
                }
            },
        })
    }

    deleteUser(user: UserEntity): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '80%',
            height: '25%',
            data: user,
        })

        dialogRef.afterClosed().subscribe({
            next: (result: UserEntity) => {
                if (result) {
                    this.bakeryManagementApiService.deleteUser(user.id!).subscribe({
                        next: () => {
                            this.getUsers()
                        },
                        error: (error) => {
                            console.log('Error: ', error)
                        },
                    })
                }
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
}
