import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { NgIf } from '@angular/common'

import { cloneDeep, isEqual } from 'lodash-es'
import { MatButton } from '@angular/material/button'
import {
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog'
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field'
import { MatInput } from '@angular/material/input'

import { ProductEntity } from 'src/app/shared/models/product.model'

@Component({
    selector: 'app-create-update-product-dialog',
    templateUrl: './create-update-product-dialog.component.html',
    styleUrls: ['./create-update-product-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatButton,
        MatDialogClose,
        NgIf,
    ],
})
export class CreateUpdateProductDialogComponent implements OnInit {
    @Input() action!: 'create' | 'update'
    @Input() product?: ProductEntity

    @Output() createProduct = new EventEmitter<ProductEntity>()
    @Output() updateProduct = new EventEmitter<ProductEntity>()

    form: FormGroup = new FormGroup({})
    private initialFormValues: unknown

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = cloneDeep(this.form.value)
    }

    initializeForm(): void {
        const formData =
            this.action === 'update' && this.product
                ? this.product
                : {
                      product_name: '',
                      price: '',
                      description: '',
                      image: '',
                      ingredients: '',
                  }

        this.form = this.fb.group({
            product_name: [formData.product_name, Validators.required],
            price: [formData.price, Validators.required],
            description: [formData.description],
            image: [formData.image],
            ingredients: [formData.ingredients],
        })
    }

    formHasChanged(): boolean {
        return !isEqual(this.initialFormValues, this.form.value)
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched()
            return
        }

        const capitalize = (value: string) =>
            value ? value.charAt(0).toUpperCase() + value.slice(1) : value
        const productName = capitalize(this.form.value.product_name)
        this.form.patchValue({ product_name: productName })

        if (this.action === 'create') {
            this.createProduct.emit(this.form.value)
        } else {
            this.updateProduct.emit(this.form.value)
        }
    }
}
