import { Component, Inject, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ProductEntity } from 'src/shared/models/product.model'
import { UserEntity } from 'src/shared/models/user.model'
import { BakeryManagementService } from 'src/services/bakery-management.service'

@Component({
    selector: 'app-filter-dialog',
    templateUrl: './filter-dialog.component.html',
    styleUrls: ['./filter-dialog.component.css'],
})
export class FilterDialogComponent implements OnInit {
    products: ProductEntity[] = []
    clients: UserEntity[] = []
    sellers: UserEntity[] = []

    filterForm: FormGroup = new FormGroup({})

    constructor(
        public dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private bakeryManagementService: BakeryManagementService
    ) {
        this.filterForm = new FormGroup({
            client: new FormControl(data?.client || ''),
            seller: new FormControl(data?.seller || ''),
            startDate: new FormControl(data?.startDate || ''),
            endDate: new FormControl(data?.endDate || ''),
        })
    }

    // TODO: Check product requirements. Do we actually want to filter by product??
    ngOnInit(): void {
        this.bakeryManagementService.getAllUsers().subscribe({
            next: (res) => {
                this.clients = res.filter((user) => user.role === 'Client')
                this.sellers = res.filter(
                    (user) =>
                        user.role === 'Seller' || user.role === 'Admin' || user.role === 'Manager'
                )
            },
            error: (err) => {
                console.log('There was an error getting users:', err)
            },
        })
        // TODO: Implement Pagination
        // this.bakeryManagementService.getAllProducts(0, 20).subscribe({
        //     next: (res) => {
        //         this.products = res.products
        //     },
        //     error: (error) => {
        //         console.log('There was an error getting products:', error)
        //     },
        // })
    }

    applyFilter() {
        const filterValues = {
            client: this.filterForm.value.client ? this.filterForm.value.client : undefined,
            seller: this.filterForm.value.seller ? this.filterForm.value.seller : undefined,
            startDate: this.filterForm.value.startDate
                ? this.adjustDateForTimezone(new Date(this.filterForm.value.startDate))
                : undefined,
            endDate: this.filterForm.value.endDate
                ? this.adjustDateForTimezone(new Date(this.filterForm.value.endDate))
                : undefined,
        }

        this.dialogRef.close(filterValues)
    }

    adjustDateForTimezone(date: Date): string {
        // Add 24 hours to the date and return as an ISO string
        return new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString()
    }

    dateFilter = (d: Date | null): boolean => {
        const current = d || new Date()
        return current < new Date() // Allow only dates before today
    }

    compareUsers(user1: UserEntity, user2: UserEntity) {
        return user1 && user2 ? user1.id === user2.id : user1 === user2
    }
}
