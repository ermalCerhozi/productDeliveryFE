import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import {
    Observable,
    Subject,
    Subscription,
    combineLatest,
    debounceTime,
    fromEvent,
    map,
} from 'rxjs'
import { OrderEntity, OrderItemEntity } from 'src/app/shared/models/order.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { cloneDeep, isEqual } from 'lodash'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { SearchService } from 'src/app/services/search.service'
import { ViewChild } from '@angular/core'
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field'
import { MatInput } from '@angular/material/input'
import { NgFor, NgIf, AsyncPipe } from '@angular/common'
import { MatOption } from '@angular/material/core'
import { MatMiniFabButton, MatFabButton, MatButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'

@Component({
    selector: 'app-create-update-orders',
    templateUrl: './create-update-orders.component.html',
    styleUrls: ['./create-update-orders.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
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
        MatDialogClose,
        AsyncPipe,
    ],
})
export class CreateUpdateOrdersComponent implements OnInit, OnDestroy {
    @ViewChild('autoCompleteProducts') autoCompleteProducts!: MatAutocomplete
    @ViewChild('autoCompleteClients') autoCompleteClients!: MatAutocomplete
    private scrollSubscription!: Subscription

    @Input() actionType!: string
    @Input() order?: OrderEntity
    @Output() saveOrder = new EventEmitter<void>()

    private unsubscribe$ = new Subject<void>()

    clients: Observable<FilterOption[]>
    hasMoreClientsToLoad: Observable<boolean>

    products: Observable<FilterOption[]>
    hasMoreProductsToLoad: Observable<boolean>

    selectedProducts: string[] = []
    orderForm: FormGroup = new FormGroup({})
    orderItemsFormArray!: FormArray
    totalOrderPrice = 0
    private currentOrder!: any

    constructor(
        private formBuilder: FormBuilder,
        private bakeryManagementService: BakeryManagementService,
        private searchService: SearchService
    ) {
        this.clients = this.searchService.getClients()
        this.hasMoreClientsToLoad = this.searchService.getHasMoreClientsToLoad()

        this.products = this.searchService.getProducts()
        this.hasMoreProductsToLoad = this.searchService.getHasMoreProductsToLoad()
    }

    ngOnInit(): void {
        // load the 20 first clients and products
        this.loadMoreClients()
        this.loadMoreProducts()
        // patch the form with the initial values
        this.patchForm()
        this.currentOrder = cloneDeep(this.orderForm.value)

        this.subscribeToFormChanges()
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
    }

    /**
     * This method subscribes to changes in the orderItemsFormArray.
     * Whenever a change occurs, it performs the following actions:
     * 1. Recalculates the total order price.
     * 2. Updates the list of selected products.
     * 3. Filters the products list to exclude the selected products.
     */
    private subscribeToFormChanges(): void {
        this.orderItemsFormArray.valueChanges.pipe().subscribe((orderItems: any[]) => {
            if (this.orderItemsFormArray.valid) {
                // Recalculate the total order price
                this.calculateTotalOrderPrice(orderItems)
    
                // Update the list of selected products
                this.selectedProducts = orderItems
                    .map((item) => item.product.label)
                    .filter(
                        (value, index, self) => self.indexOf(value) === index && value !== undefined
                    )
    
                // Filter the products list to exclude the selected products
                this.products = combineLatest([this.products, this.selectedProducts]).pipe(
                    map(([products, selectedProducts]) => {
                        const smth = products.filter(
                            (product) => !selectedProducts.includes(product.label)
                        )
                        return smth
                    })
                )
            }
        })
    }

    patchForm() {
        let formData: any
        if (this.actionType === 'create') {
            formData = this.getCreateOrderFormData()
        } else if (this.actionType === 'update') {
            formData = this.transformedOrder(this.order!)
            this.calculateTotalOrderPrice(formData.order_items) // Calculate the total order price for the update form
        }

        this.orderForm = this.formBuilder.group({
            client: [formData.client, Validators.required],
            seller: [formData.seller, Validators.required],
            order_items: this.formBuilder.array([]),
        })

        this.orderItemsFormArray = this.orderForm.get('order_items') as FormArray
        this.populateOrderItems(formData.order_items)
    }

    getCreateOrderFormData(): any {
        return {
            client: '',
            seller: this.bakeryManagementService.getLoggedInUser().id,
            order_items: [{ quantity: '', returned_quantity: '', product: '' }],
        }
    }

    transformedOrder(order: OrderEntity): any {
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

    getLastClientOrder() {
        const client = this.orderForm.get('client')!.value.value;
        this.bakeryManagementService.getLastOrder(client).subscribe({
            next: (res) => {
                const transformedOrderItems = this.transformedOrderItems(res.order_items);
                this.orderItemsFormArray.clear()
                this.populateOrderItems(transformedOrderItems);
            },
            error: (error: Error) => {
                console.log('There was an error getting the last order:', error)
            },
        })
    }

    // TODO: Needs refactoring
    // TODO: Maybe store the most selled product in chache so they can be accessed quicker
    calculateTotalOrderPrice(orderItems: any[]) {
        // Filter out order items without a product
        const validOrderItems = orderItems.filter(
            (item) => item.product && (item.quantity || item.returned_quantity)
        )
        if (validOrderItems.length === 0) {
            this.totalOrderPrice = 0
            return
        }

        //Get the product IDs of the valid order items and retrueve their prices
        const productIds = validOrderItems.map((item) => item.product.value)
        this.bakeryManagementService.getProductPricesByIds(productIds).subscribe((prices) => {
            this.totalOrderPrice = 0

            // Calculate the total order price
            validOrderItems.forEach((item) => {
                const price = prices[item.product.label]
                const quantity = item.quantity ? item.quantity : 0
                const returnedQuantity = item.returned_quantity ? item.returned_quantity : 0
                this.totalOrderPrice += price * (quantity - returnedQuantity)
            })
        })
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
        return !isEqual(this.currentOrder, this.orderForm.value)
    }

    // This function is triggered when the autocomplete panel is opened.
    // It creates a subscription to the scroll event of the autocomplete panel.
    // The debounceTime(200) is used to limit the number of events triggered.
    onOpened(autoComplete: MatAutocomplete) {
        if (autoComplete && autoComplete.panel) {
            this.scrollSubscription = fromEvent(autoComplete.panel.nativeElement, 'scroll')
                .pipe(debounceTime(200))
                .subscribe((e) => this.onScroll(e, autoComplete))
        }
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
                    returned_quantity: item.returned_quantity === '' ? 0 : item.returned_quantity,
                })),
            }
            this.saveOrder.emit(newValue)
        }
    }
}
