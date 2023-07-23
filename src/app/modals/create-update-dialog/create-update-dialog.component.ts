import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { OrderItemEntity } from 'src/core/models/order.model'
import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.css'],
})
export class CreateUpdateDialogComponent implements OnInit, OnDestroy {
    form: FormGroup = new FormGroup({})
    private unsubscribe$ = new Subject<void>()

    seller: UserEntity = JSON.parse(localStorage.getItem('currentUser') || '')
    products: ProductEntity[] = []
    usedProducts: number[] = []
    clients: UserEntity[] = []
    orderItemsFormArray: any | undefined
    roles = ['manager', 'seller', 'client']
    totalOrderPrice = 0

    constructor(
        public dialogRef: MatDialogRef<CreateUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public bakeryManagementService: BakeryManagementService,
        private fb: FormBuilder
    ) {}

    initialFormValues: any

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = this.form.value
    }

    initializeForm(): void {
        let formData

        if (this.data.type === 'user') {
            formData =
                this.data.action === 'update' && this.data.user
                    ? {
                          ...this.data.user,
                          role: this.data.user.role.toLowerCase(),
                      }
                    : {
                          first_name: '',
                          last_name: '',
                          nickname: '',
                          phone_number: '',
                          role: '',
                          password: '',
                      }

            this.form = this.fb.group({
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
            console.log(JSON.stringify(formData, null, 4))
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

            this.form = this.fb.group({
                product_name: [formData.product_name, Validators.required],
                price: [formData.price, Validators.required],
                description: [formData.description],
                image: [formData.image],
                ingredients: [formData.ingredients],
            })
        } else if (this.data.type === 'order') {
            this.bakeryManagementService.getAllUsers().subscribe({
                next: (res) => {
                    this.clients = res.filter((user) => user.role === 'Client')
                },
                error: (err) => {
                    console.log('There was an error getting clients:', err)
                },
            })
            this.bakeryManagementService.getAllProducts().subscribe({
                next: (res) => {
                    this.products = res
                    this.calculateTotalOrderPrice(this.form.get('order_items')!.value)
                },
                error: (error) => {
                    console.log('There was an error getting products:', error)
                },
            })

            let formData

            if (this.data.action === 'update' && this.data.order) {
                this.usedProducts = this.data.order.order_items.map((item: any) => item.product.id)
                formData = {
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
                this.usedProducts = [] // Ensure that usedProducts is empty if not in update mode
                formData = {
                    client: '',
                    seller: this.seller.id,
                    order_items: [],
                }
            }

            this.form = this.fb.group({
                client: [formData.client, Validators.required],
                seller: [formData.seller, Validators.required],
                order_items: this.fb.array([]),
            })

            this.orderItemsFormArray = this.form.get('order_items') as FormArray
            formData.order_items.forEach((orderItem: OrderItemEntity) => {
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

            this.orderItemsFormArray.valueChanges
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((orderItems: any) => {
                    this.calculateTotalOrderPrice(orderItems)
                })
        }
    }

    calculateTotalOrderPrice(orderItems: any) {
        this.totalOrderPrice = 0
        for (const item of orderItems) {
            const product = this.products.find((p) => p.id === item.product)
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
        return this.products.filter((product) => !this.usedProducts.includes(product.id))
    }

    formHasChanged(): boolean {
        return JSON.stringify(this.initialFormValues) !== JSON.stringify(this.form.value)
    }

    onSubmit(): void {
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
