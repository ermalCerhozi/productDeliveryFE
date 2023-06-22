import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-create-product-dialog',
    templateUrl: './create-product-dialog.component.html',
    styleUrls: ['./create-product-dialog.component.css'],
})
export class CreateProductDialogComponent implements OnInit {
    productForm: FormGroup = new FormGroup({})

    constructor(
        public dialogRef: MatDialogRef<CreateProductDialogComponent>,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.productForm = this.fb.group({
            product_name: ['', Validators.required],
            price: ['', Validators.required],
            description: [''],
            image: [''],
            ingredients: [''],
        })
    }

    onSubmit(): void {
        if (this.productForm.valid) {
            this.dialogRef.close(this.productForm.value)
        }
    }
}
