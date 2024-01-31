import { Component, Inject, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { UserEntity } from 'src/shared/models/user.model'

@Component({
    selector: 'app-filter-dialog',
    templateUrl: './filter-dialog.component.html',
    styleUrls: ['./filter-dialog.component.css'],
})
export class FilterDialogComponent implements OnInit {
    clients: UserEntity[] = []
    sellers: UserEntity[] = []
    filterForm: FormGroup = new FormGroup({})

    constructor(
        public dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.clients = data?.clients
        this.sellers = data?.sellers
    }

    ngOnInit(): void {
        const selecteClient = this.clients.find((client) => {
            return client.id === this.data.clientId
        })
        const selectedSeller = this.sellers.find((seller) => {
            return seller.id === this.data.sellerId
        })

        this.filterForm = new FormGroup({
            client: new FormControl(selecteClient || ''),
            seller: new FormControl(selectedSeller || ''),
            startDate: new FormControl(this.data?.startDate || ''),
            endDate: new FormControl(this.data?.endDate || ''),
        })
    }

    applyFilter() {
        const filterValues = {
            client: this.filterForm.value.client ? this.filterForm.value.client : undefined,
            seller: this.filterForm.value.seller ? this.filterForm.value.seller : undefined,
            startDate: this.filterForm.value.startDate
                ? new Date(this.filterForm.value.startDate).toISOString()
                : undefined,
            endDate: this.filterForm.value.endDate
                ? new Date(this.filterForm.value.endDate).toISOString()
                : undefined,
        }
        console.log('filterValues', filterValues)

        this.dialogRef.close(filterValues)
    }

    dateFilter = (d: Date | null): boolean => {
        const current = d || new Date()
        return current <= new Date() // Allow only dates before today and today
    }
}
