import { Component, Inject, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'
import { BakeryManagementService } from 'src/services/bakery-management.service'

@Component({
    selector: 'app-filter-dialog',
    templateUrl: './filter-dialog.component.html',
    styleUrls: ['./filter-dialog.component.css'],
})
export class FilterDialogComponent implements OnInit {
    products: ProductEntity[] = []
    clients: UserEntity[] = []
    users: UserEntity[] = []

    filterForm = new FormGroup({
        client: new FormControl(''),
        users: new FormControl(''),
        startDate: new FormControl(''),
        endDate: new FormControl(''),
    })

    constructor(
        public dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private bakeryManagementService: BakeryManagementService
    ) {}

    ngOnInit(): void {
        this.bakeryManagementService.getAllUsers().subscribe({
            next: (res) => {
                this.clients = res.filter((user) => user.role === 'Client')
                this.users = res
            },
            error: (err) => {
                console.log('There was an error getting clients:', err)
            },
        })
        this.bakeryManagementService.getAllProducts().subscribe({
            next: (res) => {
                this.products = res
            },
            error: (error) => {
                console.log('There was an error getting products:', error)
            },
        })
    }

    applyFilter() {
        // Apply your filtering logic here
        this.dialogRef.close(this.filterForm.value)
    }

    dateFilter = (d: Date | null): boolean => {
        const current = d || new Date()
        return current < new Date() // Allow only dates before today
    }
}
