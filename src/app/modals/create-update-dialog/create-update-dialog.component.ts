import { Component, Inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.css'],
})
export class CreateUpdateDialogComponent implements OnInit {
    dataForm: FormGroup = new FormGroup({})

    constructor(
        public dialogRef: MatDialogRef<CreateUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder
    ) {}

    initialFormValues: any

    ngOnInit(): void {
        let formData

        if (this.data.type === 'user') {
            formData =
                this.data.action === 'update' && this.data.user
                    ? this.data.user
                    : {
                          first_name: '',
                          last_name: '',
                          nickname: '',
                          phone_number: '',
                          role: '',
                          password: '',
                      }

            this.dataForm = this.fb.group({
                first_name: [formData.first_name, Validators.required],
                last_name: [formData.last_name, Validators.required],
                nickname: [formData.nickname, Validators.required],
                phone_number: [
                    formData.phone_number,
                    [Validators.required, Validators.minLength(10)],
                ],
                role: [formData.role, Validators.required],
                password: [formData.password, Validators.required],
            })
        } else if (this.data.type === 'product') {
            formData =
                this.data.action === 'update' && this.data.product
                    ? this.data.product
                    : {
                          product_name: '',
                          price: '',
                          description: '',
                          image: '',
                          ingredients: '',
                      }

            this.dataForm = this.fb.group({
                product_name: [formData.product_name, Validators.required],
                price: [formData.price, Validators.required],
                description: [formData.description],
                image: [formData.image],
                ingredients: [formData.ingredients],
            })
        } else if (this.data.type === 'order') {
            formData =
                this.data.action === 'update' && this.data.order
                    ? this.data.order
                    : {
                          order_number: '',
                          customer_name: '',
                          total_price: '',
                          status: '',
                      }

            this.dataForm = this.fb.group({
                order_number: [formData.order_number, Validators.required],
                customer_name: [formData.customer_name, Validators.required],
                total_price: [formData.total_price, Validators.required],
                status: [formData.status],
            })
        }

        this.initialFormValues = this.dataForm.value
    }

    formHasChanged(): boolean {
        return JSON.stringify(this.initialFormValues) !== JSON.stringify(this.dataForm.value)
    }

    onSubmit(): void {
        if (this.dataForm.valid) {
            this.dialogRef.close(this.dataForm.value)
        }
    }
}
