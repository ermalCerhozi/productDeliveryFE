import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core'
import {
    FormArray,
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { NgFor, NgIf, AsyncPipe } from '@angular/common'

import { Observable, Subject, Subscription, debounceTime, fromEvent, map, takeUntil } from 'rxjs'
import { cloneDeep, isEqual } from 'lodash-es'
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { MatMiniFabButton, MatFabButton, MatButton } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import { MatDialogActions } from '@angular/material/dialog'
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'

import { OrderEntity, OrderItemEntity } from 'src/app/shared/models/order.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { SearchService } from 'src/app/services/search.service'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { SnackBarService } from 'src/app/services/snackbar.service'
import { NotificationService } from 'src/app/services/notification.service'

@Component({
    selector: 'app-update-order',
    templateUrl: './update-order.component.html',
    styleUrl: './update-order.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatAutocompleteTrigger,
        MatAutocomplete,
        NgFor,
        MatOption,
        NgIf,
        MatError,
        MatMiniFabButton,
        MatIcon,
        MatFabButton,
        MatDialogActions,
        MatButton,
        AsyncPipe,
    ],
})
export class UpdateOrderComponent implements OnInit, OnDestroy {
    @ViewChild('autoCompleteProducts') autoCompleteProducts!: MatAutocomplete
    @ViewChild('autoCompleteClients') autoCompleteClients!: MatAutocomplete
    private scrollSubscription!: Subscription

    private destroy$ = new Subject<boolean>();

    clients: Observable<FilterOption[]>
    hasMoreClientsToLoad: Observable<boolean>

    products: Observable<FilterOption[]>
    hasMoreProductsToLoad: Observable<boolean>

    filteredProducts: FilterOption[] = []
    orderForm: FormGroup = new FormGroup({})
    orderItemsFormArray!: FormArray
    totalOrderPrice = 0
    previousOrders: number = 0
    private currentOrder!: any
    private cuurrentOrderFormState: any

    private formBuilder = inject(FormBuilder)
    private bakeryManagementService = inject(BakeryManagementService)
    private searchService = inject(SearchService)
    private route = inject(ActivatedRoute)
    private bakeryManagementApiService = inject(BakeryManagementApiService)
    private snackBarService = inject(SnackBarService)
    private router = inject(Router)
    private notificationService = inject(NotificationService)

    constructor() {
        this.clients = this.searchService.getClients()
        this.hasMoreClientsToLoad = this.searchService.getHasMoreClientsToLoad()

        this.products = this.searchService.getProducts()
        this.hasMoreProductsToLoad = this.searchService.getHasMoreProductsToLoad()
    }

    ngOnInit(): void {
        // load the 20 first clients and products
        this.loadMoreClients()
        this.loadMoreProducts()
        this.setInitialFilteredProducts()
        // initialize the form with the initial values
        this.initializeForm()
        this.route.queryParams.subscribe((params) => {
            const orderId = params['id']
            if (orderId) {
                this.getOrderById(orderId)
            }
        })
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete()
    }

    initializeForm(): void {
        this.orderForm = this.formBuilder.group({
            client: ['', Validators.required],
            seller: ['', Validators.required],
            order_items: this.formBuilder.array([]),
        })
    }

    getOrderById(orderId: number) {
        this.bakeryManagementService.getOrderById(orderId).subscribe({
            next: (order: OrderEntity) => {
                this.currentOrder = order

                this.patchForm()
            },
            error: (error: Error) => {
                console.log('There was an error fetching the order:', error)
            },
        })
    }

    /**
     * This method subscribes to changes in the orderItemsFormArray.
     * Whenever a change occurs, it performs the following actions:
     * 1. Recalculates the total order price.
     * 2. Updates the list of selected products.
     * 3. Filters the products list to exclude the selected products.
     */
    private subscribeToFormChanges(): void {
        this.orderItemsFormArray.valueChanges
            .pipe(debounceTime(60), takeUntil(this.destroy$))
            .subscribe((orderItems: any[]) => {
                // Check if all order items have a valid product field
                if (this.orderItemsFormArray.valid) {
                    // Recalculate the total order price
                    this.calculateTotalOrderPrice(orderItems)
                    // Process selected products
                    this.processSelectedProducts(orderItems)
                }
            })
    }

    calculateTotalOrderPrice(orderItems: any[]) {
        const validOrderItems = orderItems.filter(
            item => item.product && (item.quantity || item.returned_quantity)
        );
        this.totalOrderPrice = validOrderItems.reduce((total, item) => {
            const quantity = item.quantity ?? 0;
            const returnedQuantity = item.returned_quantity ?? 0;
            return total + item.product.price * (quantity - returnedQuantity);
        }, 0);
    }

    processSelectedProducts(orderItems: any[]): void {
        const selectedProductsMap = new Map();
        orderItems.forEach(item => {
            if (item.product && item.product.label) {
                selectedProductsMap.set(item.product.value, {
                    label: item.product.label,
                    value: item.product.value,
                });
            }
        });
        const selectedProducts = Array.from(selectedProductsMap.values());
        if (selectedProducts.length === 0) {
            return;
        }

        this.products
            .pipe(
                map(products =>
                    products.filter(
                        product => !selectedProducts.some(selected => selected.value === product.value)
                    )
                )
            )
            .subscribe(filteredProducts => {
                this.filteredProducts = filteredProducts;
            });
    }

    setInitialFilteredProducts() {
        this.products.subscribe((products) => {
            this.filteredProducts = products
        })
    }

    patchForm() {
        const formData = this.getUpdateOrderFormData(this.currentOrder!)
        this.calculateTotalOrderPrice(formData.order_items) // Calculate the total order price for the update form

        this.orderForm = this.formBuilder.group({
            client: [formData.client, Validators.required],
            seller: [formData.seller, Validators.required],
            order_items: this.formBuilder.array([]),
        })

        this.orderItemsFormArray = this.orderForm.get('order_items') as FormArray
        this.populateOrderItems(formData.order_items)

        this.cuurrentOrderFormState = cloneDeep(this.orderForm.value)
        this.processSelectedProducts(this.orderItemsFormArray.value)
        this.subscribeToFormChanges()
    }

    getUpdateOrderFormData(order: OrderEntity): any {
        const orderClient = {
            value: order.client.id,
            label: order.client.first_name + ' ' + order.client.last_name,
        }
        return {
            client: orderClient,
            seller: order.seller.id,
            order_items: this.transformedOrderItems(order.order_items),
        }
    }

    transformedOrderItems(order_items: OrderItemEntity[]): any {
        return order_items.map((item: any) => {
            const orderProduct = {
                value: item.product.id,
                label: item.product.product_name,
                price: item.product.price,
            }
            return {
                id: item.id,
                quantity: item.quantity,
                returned_quantity: item.returned_quantity,
                product: orderProduct,
            }
        })
    }

    populateOrderItems(orderItems: OrderItemEntity[]) {
        orderItems.forEach((orderItem: OrderItemEntity) => {
            this.orderItemsFormArray.push(
                this.formBuilder.group({
                    id: [orderItem.id],
                    quantity: [orderItem.quantity, Validators.required],
                    returned_quantity: [orderItem.returned_quantity],
                    product: [orderItem.product, Validators.required],
                })
            )
        })
    }

    getPreviousClientOrders() {
        this.previousOrders = this.previousOrders + 1

        const clientId = this.orderForm.get('client')!.value.value
        this.bakeryManagementService.getPreviousOrder(clientId, this.previousOrders).subscribe({
            next: (res) => {
                const transformedOrderItems = this.transformedOrderItems(res.order_items)
                this.orderItemsFormArray.clear()
                this.populateOrderItems(transformedOrderItems)
            },
            error: (error: Error) => {
                this.previousOrders = this.previousOrders - 1
                console.log('There was an error getting the last order:', error)
            },
        })
    }

    getNextClientOrders() {
        if(this.previousOrders > 0) {
            this.previousOrders = this.previousOrders - 1
            const clientId = this.orderForm.get('client')!.value.value
            this.bakeryManagementService.getPreviousOrder(clientId, this.previousOrders).subscribe({
                next: (res) => {
                    const transformedOrderItems = this.transformedOrderItems(res.order_items)
                    this.orderItemsFormArray.clear()
                    this.populateOrderItems(transformedOrderItems)
                },
                error: (error: Error) => {
                    this.previousOrders = this.previousOrders + 1
                    console.error('There was an error getting the next order:', error)
                },
            })
        }
    }

    addNewOrderItem(): void {
        const newOrderItem = this.formBuilder.group({
            quantity: ['', Validators.required],
            returned_quantity: [''],
            product: ['', Validators.required],
        })

        this.orderItemsFormArray.push(newOrderItem)
    }

    removeOrderItem(index: number): void {
        const orderItemId = this.orderItemsFormArray.at(index).value.id
        if (orderItemId) {
            this.bakeryManagementService.deleteOrderItem(orderItemId).subscribe({
                next: () => {
                    this.orderItemsFormArray.removeAt(index)
                },
                error: (error: Error) => {
                    console.log('There was an error deleting the order item:', error)
                },
            })
        } else {
            // If the order item doesn't have an ID, it means it hasn't been saved to the server yet.
            // So we can just remove it from the form array.
            this.orderItemsFormArray.removeAt(index)
        }
    }

    displayFn(option: any): string {
        return option.label
    }

    clientSearchChange(event: any) {
        const inputValue = (event.target as HTMLInputElement).value
        this.searchService.clientSearchChange(inputValue)
    }
    loadMoreClients() {
        this.searchService.loadMoreClients()
    }

    productSearchChange(event: any) {
        const inputValue = (event.target as HTMLInputElement).value
        this.searchService.productSearchChange(inputValue)
    }
    loadMoreProducts() {
        this.searchService.loadMoreProducts()
    }

    formHasChanged(): boolean {
        return !isEqual(this.cuurrentOrderFormState, this.orderForm.value)
    }

    // This function is triggered when the autocomplete panel is opened.
    // It creates a subscription to the scroll event of the autocomplete panel.
    // The debounceTime(200) is used to limit the number of events triggered.
    onOpened(autoComplete: MatAutocomplete) {
        setTimeout(() => {
            if (autoComplete && autoComplete.panel) {
                if (autoComplete.panel) {
                    this.scrollSubscription = fromEvent(autoComplete.panel.nativeElement, 'scroll')
                        .subscribe((e) => this.onScroll(e, autoComplete))
                } else {
                    console.error('autoComplete.panel is still undefined')
                }
            }
        }, 10)
    }

    // This function is triggered when the autocomplete panel is closed.
    // It checks if there is a subscription to the scroll event and if so, it unsubscribes from it.
    // This is done to prevent memory leaks.
    onClosed() {
        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe()
        }
    }

    // This function is triggered when the autocomplete panel is scrolled.
    // It checks if the end of the panel is reached by comparing the scroll position with the total scroll height.
    // If the end is reached and there are more clients to load (hasMoreClientsToLoad is true),
    // it calls the loadMoreClients() function to load more clients.
    onScroll(event: any, autoComplete: MatAutocomplete) {
        if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
            if (autoComplete === this.autoCompleteProducts && this.hasMoreProductsToLoad) {
                this.loadMoreProducts()
            } else if (autoComplete === this.autoCompleteClients && this.hasMoreClientsToLoad) {
                this.loadMoreClients()
            }
        }
    }

    save(): void {
        if (this.orderForm.valid) {
            const formValue = this.orderForm.value
            // Convert the client and product values to their respective IDs before saving the order.
            const newValue = {
                ...formValue,
                client: formValue.client.value,
                order_items: formValue.order_items.map((item: any) => ({
                    ...item,
                    product: item.product.value,
                    quantity: item.quantity === '' ? 0 : item.quantity,
                    returned_quantity: item.returned_quantity === null || undefined || '' ? 0 : item.returned_quantity,
                })),
            }
            const params = {
                sendUpdatedNotification: this.notificationService.sendUpdatedNotification,
            }

            this.bakeryManagementApiService.updateOrder(this.currentOrder.id, newValue, params).subscribe({
                next: () => {
                    this.snackBarService.showSuccess('Created successfully')
                    this.goBack()
                },
                error: (error) => {
                    console.log('Error: ', error)
                    this.goBack()
                },
            })
        }
    }

    goBack(): void {
        this.router.navigate(['/orders'])
    }
}
