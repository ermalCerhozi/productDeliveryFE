import { Component, Inject, OnInit } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { OrderItemEntity } from 'src/core/models/order.model'
import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'
import { BakeryManagementService } from 'src/services/bakery-management.service'

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.css'],
})
export class CreateUpdateDialogComponent implements OnInit {
    dataForm: FormGroup = new FormGroup({})

    products: ProductEntity[] = []
    clients: UserEntity[] = []
    orderItemsFormArray: any | undefined
    roles = ['manager', 'seller', 'client']

    constructor(
        public dialogRef: MatDialogRef<CreateUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private bakeryManagementApiService: BakeryManagementApiService,
        public bakeryManagementService: BakeryManagementService,
        private fb: FormBuilder
    ) {}

    initialFormValues: any

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = this.dataForm.value
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

            this.dataForm = this.fb.group({
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
                },
                error: (error) => {
                    console.log('There was an error getting products:', error)
                },
            })
            formData =
                this.data.action === 'update' && this.data.order
                    ? {
                          order_date: this.data.order.order_date,
                          client: this.data.order.client.id,
                          seller: this.data.order.seller.id,
                          order_items: this.data.order.order_items.map((item: any) => ({
                              id: item.id,
                              quantity: item.quantity,
                              product: item.product.id,
                          })),
                      }
                    : {
                          order_date: '',
                          client: '',
                          seller: '',
                          order_items: [],
                      }

            this.dataForm = this.fb.group({
                order_date: [formData.order_date, Validators.required],
                client: [formData.client, Validators.required],
                seller: [formData.seller, Validators.required],
                order_items: this.fb.array([]),
            })
            console.log(JSON.stringify(formData, null, 4))

            this.orderItemsFormArray = this.dataForm.get('order_items') as FormArray
            formData.order_items.forEach((orderItem: OrderItemEntity) => {
                this.orderItemsFormArray.push(
                    this.fb.group({
                        id: [orderItem.id],
                        quantity: [orderItem.quantity, Validators.required],
                        product: [orderItem.product, Validators.required],
                    })
                )
            })
        }
    }

    addOrderItem(): void {
        const orderItemsFormArray = this.dataForm.get('order_items') as FormArray
        orderItemsFormArray.push(
            this.fb.group({
                id: [''],
                quantity: ['', Validators.required],
                product: ['', Validators.required],
            })
        )
    }

    removeOrderItem(index: number): void {
        const orderItemsFormArray = this.dataForm.get('order_items') as FormArray
        orderItemsFormArray.removeAt(index)
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
