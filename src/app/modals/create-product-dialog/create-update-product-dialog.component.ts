import { Component, Inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-create-update-product-dialog',
    templateUrl: './create-update-product-dialog.component.html',
    styleUrls: ['./create-update-product-dialog.component.css'],
})
export class CreateUpdateProductDialogComponent implements OnInit {
    productForm: FormGroup = new FormGroup({})

    constructor(
        public dialogRef: MatDialogRef<CreateUpdateProductDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder
    ) {}

    initialFormValues: any

    ngOnInit(): void {
        const product =
            this.data.action === 'update' && this.data.product
                ? this.data.product
                : {
                      product_name: '',
                      price: '',
                      description: '',
                      image: '',
                      ingredients: '',
                  }

        this.productForm = this.fb.group({
            product_name: [product.product_name, Validators.required],
            price: [product.price, Validators.required],
            description: [product.description],
            image: [product.image],
            ingredients: [product.ingredients],
        })

        this.initialFormValues = this.productForm.value
    }

    formHasChanged(): boolean {
        return JSON.stringify(this.initialFormValues) !== JSON.stringify(this.productForm.value);
    }

    onSubmit(): void {
        if (this.productForm.valid) {
            this.dialogRef.close(this.productForm.value)
        }
    }
}
