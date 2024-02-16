import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { Form, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { OrderEntity, OrderItemEntity } from 'src/trackEase/shared/models/order.model'
import { ProductEntity } from 'src/trackEase/shared/models/product.model'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { BakeryManagementService } from 'src/trackEase/services/bakery-management.service'
import { UserEntity } from 'src/trackEase/shared/models/user.model'

interface CreateUpdateOrderData {
    action: string
    order?: OrderEntity
    seller: UserEntity
    clients: UserEntity[]
    products: ProductEntity[]
}

@Component({
    selector: 'app-create-update-orders',
    templateUrl: './create-update-orders.component.html',
    styleUrls: ['./create-update-orders.component.scss'],
})
export class CreateUpdateOrdersComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>()
    form: FormGroup = new FormGroup({})

    usedProducts: number[] = []
    orderItemsFormArray!: FormArray
    totalOrderPrice = 0
    initialFormValues!: Form

    constructor(
        private fb: FormBuilder,
        private bakeryManagementService: BakeryManagementService,
        public dialogRef: MatDialogRef<CreateUpdateOrdersComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: CreateUpdateOrderData
    ) {}

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = this.form.value
    }

    initializeForm() {
        const formData = this.getFormData()

        this.form = this.fb.group({
            client: [formData.client, Validators.required],
            seller: [formData.seller, Validators.required],
            order_items: this.fb.array([]), //The order_items field is initialized as an empty FormArray because each item in order_items needs to be a FormGroup itself.
        })

        this.orderItemsFormArray = this.form.get('order_items') as FormArray
        this.populateOrderItems(formData.order_items)

        this.orderItemsFormArray.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((orderItems: any) => {
                this.calculateTotalOrderPrice(orderItems)
            })
    }

    getFormData() {
        if (this.data.action === 'update' && this.data.order) {
            this.usedProducts = this.data.order.order_items.map((item: any) => item.product.id)
            return {
                client: this.data.order.client.id,
                seller: this.data.order.seller.id,
                order_items: this.data.order.order_items.map((item: any) => ({
                    id: item.id,
                    quantity: item.quantity,
                    returned_quantity: item.returned_quantity,
                    product: item.product.id,
                })),
            }
        } else {
            this.usedProducts = []
            return {
                client: '',
                seller: this.data.seller.id,
                order_items: [],
            }
        }
    }

    populateOrderItems(orderItems: OrderItemEntity[]) {
        orderItems.forEach((orderItem: OrderItemEntity) => {
            if (orderItem.id === undefined) {
                this.orderItemsFormArray.push(
                    this.fb.group({
                        quantity: [orderItem.quantity, Validators.required],
                        returned_quantity: [orderItem.returned_quantity, Validators.required],
                        product: [orderItem.product, Validators.required],
                    })
                )
            } else {
                this.orderItemsFormArray.push(
                    this.fb.group({
                        id: [orderItem.id],
                        quantity: [orderItem.quantity, Validators.required],
                        returned_quantity: [orderItem.returned_quantity, Validators.required],
                        product: [orderItem.product, Validators.required],
                    })
                )
            }
        })
    }

    calculateTotalOrderPrice(orderItems: any) {
        this.totalOrderPrice = 0
        for (const item of orderItems) {
            const product = this.data.products.find((p: ProductEntity) => p.id === item.product)
            if (product) {
                const productPrice = parseFloat(product.price)
                this.totalOrderPrice += (item.quantity - item.returned_quantity) * productPrice
            }
        }
    }

    addOrderItem(): void {
        const orderItemsFormArray = this.form.get('order_items') as FormArray
        orderItemsFormArray.push(
            this.fb.group({
                quantity: ['', Validators.required],
                returned_quantity: [0, Validators.required],
                product: ['', Validators.required],
            })
        )

        // Subscribe to product field changes
        let previousProductId: number // Keep track of the previous product ID

        orderItemsFormArray.controls[orderItemsFormArray.length - 1]
            .get('product')!
            .valueChanges.subscribe((productId) => {
                this.handleProductChange(productId, previousProductId)
                // Update previousProductId with the new value
                previousProductId = productId
            })
    }

    handleProductChange(newProductId: number, oldProductId?: number): void {
        // If a previous product was selected, remove it from the usedProducts array
        if (oldProductId) {
            this.usedProducts = this.usedProducts.filter((id) => id !== oldProductId)
        }

        // Add the new product to the usedProducts array if it's not already included
        if (!this.usedProducts.includes(newProductId)) {
            this.usedProducts.push(newProductId)
        }
    }

    removeOrderItem(index: number): void {
        const orderItemsFormArray = this.form.get('order_items') as FormArray
        const orderItemId = orderItemsFormArray.at(index).value.id
        if (orderItemId) {
            this.bakeryManagementService.deleteOrderItem(orderItemId).subscribe({
                next: () => {
                    const removedProductId = orderItemsFormArray.at(index).value.product
                    this.usedProducts = this.usedProducts.filter((id) => id !== removedProductId)
                    orderItemsFormArray.removeAt(index)
                },
                error: (error: any) => {
                    console.log('There was an error deleting the order item:', error)
                },
            })
        } else {
            const removedProductId = orderItemsFormArray.at(index).value.product
            this.usedProducts = this.usedProducts.filter((id) => id !== removedProductId)
            orderItemsFormArray.removeAt(index)
        }
    }

    getUnusedProducts() {
        return this.data.products.filter(
            (product: ProductEntity) => !this.usedProducts.includes(product.id)
        )
    }

    formHasChanged(): boolean {
        return JSON.stringify(this.initialFormValues) !== JSON.stringify(this.form.value)
    }

    inserItem(): void {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value)
            console.log('onSubmit', JSON.stringify(this.form.value, null, 4))
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
    }
}
