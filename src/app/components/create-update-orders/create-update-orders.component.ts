import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { OrderItemEntity } from 'src/shared/models/order.model'
import { ProductEntity } from 'src/shared/models/product.model'
import { UserEntity } from 'src/shared/models/user.model'

@Component({
    selector: 'app-create-update-orders',
    templateUrl: './create-update-orders.component.html',
    styleUrls: ['./create-update-orders.component.css'],
})
export class CreateUpdateOrdersComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>()
    form: FormGroup = new FormGroup({})
    roles = ['admin', 'manager', 'seller', 'client']

    usedProducts: number[] = []
    orderItemsFormArray: any | undefined
    totalOrderPrice = 0

    // @Input
    @Input() action!: string
    @Input() order!: any //Order to be updated
    @Input() seller: UserEntity = JSON.parse(localStorage.getItem('currentUser') || '') //Seller that creates the order
    @Input() clients!: UserEntity[] //Clients to whom we can create orders for
    @Input() products!: ProductEntity[] //Products to create orders with

    // @Output
    @Output() updateProduct = new EventEmitter<ProductEntity>()
    @Output() createProduct = new EventEmitter()

    constructor(public bakeryManagementService: BakeryManagementService, private fb: FormBuilder) {}

    initialFormValues: any

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = this.form.value
    }

    initializeForm() {
        this.bakeryManagementService.getAllUsers().subscribe({
            next: (res) => {
                this.clients = res.filter((user) => user.role === 'Client')
            },
            error: (err) => {
                console.log('There was an error getting clients:', err)
            },
        })
        // TODO: implement pagination
        this.bakeryManagementService.updateProductList(true).subscribe({
            next: (res) => {
                // TODO: Implement pagination
                this.products = res.products
                this.calculateTotalOrderPrice(this.form.get('order_items')!.value)
            },
            error: (error) => {
                console.log('There was an error getting products:', error)
            },
        })
        let formData
        if (this.action === 'update' && this.order) {
            this.usedProducts = this.order.order_items.map((item: any) => item.product.id)
            formData = {
                client: this.order.client.id,
                seller: this.order.seller.id,
                order_items: this.order.order_items.map((item: any) => ({
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

    calculateTotalOrderPrice(orderItems: any) {
        this.totalOrderPrice = 0
        for (const item of orderItems) {
            const product = this.products!.find((p) => p.id === item.product)
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
        return this.products!.filter((product) => !this.usedProducts.includes(product.id))
    }

    formHasChanged(): boolean {
        return JSON.stringify(this.initialFormValues) !== JSON.stringify(this.form.value)
    }

    inserItem(): void {
        if (this.form.valid) {
            if (this.action === 'create') {
                this.createProduct.emit(this.form.value)
            } else if (this.action === 'update') {
                this.updateProduct.emit(this.form.value)
            }
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
    }
}
