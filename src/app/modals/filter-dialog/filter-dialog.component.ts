import { Component, Inject } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-filter-dialog',
    templateUrl: './filter-dialog.component.html',
    styleUrls: ['./filter-dialog.component.css'],
})
export class FilterDialogComponent {
    clients = ['client1', 'client2', 'client3'] // Replace these with your real clients
    sellers = ['seller1', 'seller2', 'seller3'] // Replace these with your real sellers

    filterForm = new FormGroup({
        client: new FormControl(''),
        seller: new FormControl(''),
        startDate: new FormControl(''),
        endDate: new FormControl(''),
    })

    constructor(
        public dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    applyFilter() {
        // Apply your filtering logic here
        this.dialogRef.close(this.filterForm.value)
    }

    dateFilter = (d: Date | null): boolean => {
        const current = d || new Date()
        // Allow only dates before today
        return current < new Date()
    }
}
