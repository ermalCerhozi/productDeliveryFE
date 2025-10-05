import {
    Component,
    inject,
    Inject,
    OnInit,
} from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'

import { finalize, take, throwError } from 'rxjs'
import { cloneDeep, isEqual } from 'lodash-es'
import { MatButton } from '@angular/material/button'
import {
    MatDialog,
    MAT_DIALOG_DATA,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog'
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field'
import { MatInput } from '@angular/material/input'
import { MatProgressSpinner } from '@angular/material/progress-spinner'

import { ProductEntity } from 'src/app/shared/models/product.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { TranslocoDirective } from '@jsverse/transloco'

type ProductFormValue = {
    product_name: string
    price: string
    description: string
    image: string
    ingredients: string
}

@Component({
    selector: 'app-create-update-product-dialog',
    templateUrl: './create-update-product-dialog.component.html',
    styleUrls: ['./create-update-product-dialog.component.scss'],
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
        MatProgressSpinner,
        TranslocoDirective,
    ],
})
export class CreateUpdateProductDialogComponent implements OnInit {
    action: 'create' | 'update' = 'create'
    form!: FormGroup
    isSubmitting = false
    isLoadingProductDetails = false

    private currentProduct: ProductEntity | null = null
    private initialFormValues: ProductFormValue | null = null
    private loadedProductId?: number

    private fb = inject(FormBuilder)
    private bakeryManagementApiService = inject(BakeryManagementApiService)
    private dialog = inject(MatDialog)

    constructor(@Inject(MAT_DIALOG_DATA) public data: { product?: ProductEntity }) {
        // Initialize form in constructor to ensure it's ready before template renders
        this.currentProduct = this.data?.product || null
        this.syncActionState()
        this.initializeForm()
    }

    ngOnInit(): void {
        this.rebuildFormStateFromCurrentContext({ skipFetch: false })
    }

    private rebuildFormStateFromCurrentContext(options?: { skipFetch?: boolean }): void {
        this.syncActionState()

        if (!options?.skipFetch && this.shouldFetchProductDetails()) {
            this.fetchProductDetails(this.currentProduct!.id)
            return
        }

        this.captureInitialFormValues()
    }

    private syncActionState(): void {
        this.action = this.currentProduct ? 'update' : 'create'
    }

    private shouldFetchProductDetails(): boolean {
        return (
            !!this.currentProduct?.id &&
            !this.isCreateMode &&
            this.currentProduct.id !== this.loadedProductId
        )
    }

    private fetchProductDetails(productId: number): void {
        if (this.isLoadingProductDetails) {
            return
        }

        this.isLoadingProductDetails = true

        this.bakeryManagementApiService
            .getProduct(productId)
            .pipe(
                finalize(() => {
                    this.isLoadingProductDetails = false
                })
            )
            .subscribe({
                next: (product) => {
                    this.currentProduct = product
                    this.loadedProductId = product.id
                    
                    // Update form values instead of reinitializing
                    const formData = this.createFormValueFromContext(product)
                    this.form.patchValue(formData)
                    this.captureInitialFormValues()
                },
                error: (error) => {
                    this.loadedProductId = productId
                    console.error('Failed to load product details', error)
                    this.rebuildFormStateFromCurrentContext({ skipFetch: true })
                },
            })
    }

    private get isCreateMode(): boolean {
        return this.action === 'create'
    }

    initializeForm(): void {
        const formData = this.createFormValueFromContext(this.currentProduct)

        this.form = this.fb.group({
            product_name: [formData.product_name, Validators.required],
            price: [formData.price, Validators.required],
            description: [formData.description],
            image: [formData.image],
            ingredients: [formData.ingredients],
        })
    }

    formHasChanged(): boolean {
        if (!this.initialFormValues) {
            return false
        }

        return !isEqual(this.initialFormValues, this.form.value)
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting || this.isLoadingProductDetails) {
            if (this.form.invalid) {
                this.form.markAllAsTouched()
            }
            return
        }

        const formValue = this.form.getRawValue() as ProductFormValue
        const formattedFormValue = this.withCapitalizedName(formValue)

        this.form.patchValue(
            {
                product_name: formattedFormValue.product_name,
            },
            { emitEvent: false }
        )

        const productValue = this.buildProductPayload(formattedFormValue)

        this.isSubmitting = true

        this.performProductMutation(productValue)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false
                })
            )
            .subscribe({
                next: (product) => this.onSuccessfulSubmission(product),
                error: (error) => {
                    console.error(
                        this.isCreateMode ? 'Failed to create product' : 'Failed to update product',
                        error
                    )
                },
            })
    }

    private captureInitialFormValues(): void {
        this.initialFormValues = cloneDeep(this.form.getRawValue()) as ProductFormValue
    }

    private createFormValueFromContext(product?: ProductEntity | null): ProductFormValue {
        if (!product || this.isCreateMode) {
            return {
                product_name: '',
                price: '',
                description: '',
                image: '',
                ingredients: '',
            }
        }

        return {
            product_name: product.product_name ?? '',
            price: product.price ?? '',
            description: product.description ?? '',
            image: product.image ?? '',
            ingredients: product.ingredients ?? '',
        }
    }

    private withCapitalizedName(formValue: ProductFormValue): ProductFormValue {
        const capitalize = (value: string) =>
            value ? value.charAt(0).toUpperCase() + value.slice(1) : value

        return {
            ...formValue,
            product_name: capitalize(formValue.product_name),
        }
    }

    private buildProductPayload(formValue: ProductFormValue): Partial<ProductEntity> {
        return {
            ...formValue,
        }
    }

    private performProductMutation(productValue: Partial<ProductEntity>) {
        if (this.isCreateMode) {
            return this.bakeryManagementApiService.createProduct(productValue as ProductEntity)
        }

        if (!this.currentProduct) {
            return throwError(
                () => new Error('Cannot update product because no product context is available.')
            )
        }

        return this.bakeryManagementApiService.updateProduct(
            this.currentProduct,
            productValue
        )
    }

    private onSuccessfulSubmission(product: ProductEntity): void {
        if (product) {
            this.currentProduct = product
            this.loadedProductId = product.id
        }
        this.dialog.closeAll()
    }
}
