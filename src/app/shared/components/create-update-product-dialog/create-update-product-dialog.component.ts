import {
    Component,
    ElementRef,
    inject,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'

import { catchError, finalize, forkJoin, map, of, switchMap, take, throwError } from 'rxjs'
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
import { MatIcon } from '@angular/material/icon'

import { ProductEntity } from 'src/app/shared/models/product.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { ImageResponse } from '../../models/image.model'
import { TranslocoDirective } from '@jsverse/transloco'

type ProductFormValue = {
    product_name: string
    price: string
    description: string
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
        MatIcon,
        TranslocoDirective,
    ],
})
export class CreateUpdateProductDialogComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>

    action: 'create' | 'update' = 'create'
    defaultProductImage = '/assets/images/product-placeholder.png'
    form!: FormGroup
    previewImageUrl: string | null = null
    isSubmitting = false
    isLoadingProductDetails = false

    private currentProduct: ProductEntity | null = null
    private initialFormValues: ProductFormValue | null = null
    private selectedImagePayload?: {
        fileName: string
        contentType: string
        data: string
    }
    private loadedProductId?: number

    private fb = inject(FormBuilder)
    private bakeryManagementApiService = inject(BakeryManagementApiService)
    private bakeryManagementService = inject(BakeryManagementService)
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
        this.updatePreviewImage()
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

        forkJoin({
            product: this.bakeryManagementApiService.getProduct(productId),
            image: this.bakeryManagementApiService.getProductImage(productId).pipe(
                catchError(() => of(null)) // If no image exists, return null
            )
        })
            .pipe(
                finalize(() => {
                    this.isLoadingProductDetails = false
                })
            )
            .subscribe({
                next: ({ product, image }) => {
                    this.currentProduct = product
                    this.loadedProductId = product.id
                    this.clearSelectedImage()
                    
                    // Set product_image if image exists
                    if (image?.data && image?.contentType) {
                        this.currentProduct.product_image = `data:${image.contentType};base64,${image.data}`
                    }
                    
                    // Update form values instead of reinitializing
                    const formData = this.createFormValueFromContext(product)
                    this.form.patchValue(formData)
                    this.captureInitialFormValues()
                    this.updatePreviewImage()
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
            ingredients: [formData.ingredients],
        })
    }

    formHasChanged(): boolean {
        if (!this.initialFormValues) {
            return !!this.selectedImagePayload
        }

        return !isEqual(this.initialFormValues, this.form.value) || !!this.selectedImagePayload
    }

    get imageButtonLabel(): string {
        return this.previewImageUrl ? 'Change Image' : 'Add Image'
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
                ingredients: '',
            }
        }

        return {
            product_name: product.product_name ?? '',
            price: product.price ?? '',
            description: product.description ?? '',
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
            return this.bakeryManagementApiService.createProduct(productValue as ProductEntity).pipe(
                switchMap((product) => this.attachImageIfNeeded(product.id, product))
            )
        }

        if (!this.currentProduct) {
            return throwError(
                () => new Error('Cannot update product because no product context is available.')
            )
        }

        return this.bakeryManagementApiService
            .updateProduct(this.currentProduct, productValue)
            .pipe(switchMap((updatedProduct) => this.attachImageIfNeeded(updatedProduct.id, updatedProduct)))
    }

    private attachImageIfNeeded(productId: number, baseProduct: ProductEntity) {
        if (!this.selectedImagePayload) {
            return of(baseProduct)
        }

        return this.bakeryManagementService
            .uploadProductImage({
                ...this.selectedImagePayload,
                productId,
            })
            .pipe(
                map((image) => {
                    const dataUri = this.buildDataUri(image)
                    if (dataUri) {
                        baseProduct.product_image = dataUri
                    }

                    return baseProduct
                })
            )
    }

    private onSuccessfulSubmission(product: ProductEntity): void {
        if (product) {
            this.currentProduct = product
            this.loadedProductId = product.id
        }

        this.clearSelectedImage()
        this.updatePreviewImage()
        this.captureInitialFormValues()
        this.dialog.closeAll()
    }

    private clearSelectedImage(): void {
        this.selectedImagePayload = undefined
        this.resetFileInput()
    }

    private resetFileInput(): void {
        if (this.fileInput?.nativeElement) {
            this.fileInput.nativeElement.value = ''
        }
    }

    openUploadPanel() {
        if (this.isSubmitting || this.isLoadingProductDetails || !this.fileInput?.nativeElement) {
            return
        }

        this.fileInput.nativeElement.click()
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement
        if (!input.files || !input.files.length) {
            return
        }

        const file = input.files[0]
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            const base64 = result?.split(',')[1]

            if (!base64) {
                console.error('Invalid image payload: unable to extract base64 data')
                return
            }

            this.selectedImagePayload = {
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
                data: base64,
            }

            this.updatePreviewImage()
        }

        reader.readAsDataURL(file)
    }

    private updatePreviewImage(): void {
        this.previewImageUrl = this.derivePreviewImage()
    }

    private buildSelectedImageDataUri(): string | null {
        if (!this.selectedImagePayload) {
            return null
        }

        return `data:${this.selectedImagePayload.contentType};base64,${this.selectedImagePayload.data}`
    }

    private buildDataUri(image: ImageResponse | null): string | null {
        if (!image?.contentType || !image?.data) {
            return null
        }

        return `data:${image.contentType};base64,${image.data}`
    }

    private derivePreviewImage(): string | null {
        const selectedImageDataUri = this.buildSelectedImageDataUri()
        if (selectedImageDataUri) {
            return selectedImageDataUri
        }

        if (this.currentProduct?.product_image) {
            return this.currentProduct.product_image
        }

        // Fallback to legacy image field if exists
        if (this.currentProduct?.image) {
            return this.currentProduct.image
        }

        return null
    }
}
