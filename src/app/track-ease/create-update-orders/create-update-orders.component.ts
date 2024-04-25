import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Observable, Subject, Subscription, debounceTime, fromEvent } from 'rxjs'
import { OrderEntity, OrderItemEntity } from 'src/app/shared/models/order.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { cloneDeep, isEqual } from 'lodash'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { SearchService } from 'src/app/services/search.service'
import { ViewChild } from '@angular/core'
import { MatAutocomplete } from '@angular/material/autocomplete'

@Component({
    selector: 'app-create-update-orders',
    templateUrl: './create-update-orders.component.html',
    styleUrls: ['./create-update-orders.component.scss'],
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

    orderForm: FormGroup = new FormGroup({})
    orderItemsFormArray!: FormArray
    totalOrderPrice = 0
    private currentQuestionData!: any

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
        this.addFormControls()
        this.patchForm()
        this.currentQuestionData = cloneDeep(this.orderForm.value)

        this.orderItemsFormArray.valueChanges.pipe().subscribe((orderItems) => {
            this.calculateTotalOrderPrice(orderItems)
        })
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
    }

    addFormControls() {
        const formControls = this.getFormControls()
        Object.keys(formControls).forEach((key) => {
            this.orderForm.addControl(key, formControls[key])
        })
    }

    private getFormControls(): any {
        return {
            client: new FormControl('', Validators.required),
            seller: new FormControl('', Validators.required),
            order_items: new FormArray([]),
        }
    }

    patchForm() {
        const formData = this.getFormData()

        this.orderForm = this.formBuilder.group({
            client: [formData.client, Validators.required],
            seller: [formData.seller, Validators.required],
            order_items: this.formBuilder.array([]),
        })

        this.orderItemsFormArray = this.orderForm.get('order_items') as FormArray
        this.populateOrderItems(formData.order_items)
    }

    getFormData(): any {
        if (this.actionType === 'create') {
            return {
                client: '',
                seller: this.bakeryManagementService.getLoggedInUser().id,
                order_items: [{ quantity: '', returned_quantity: 0, product: '' }],
            }
        } else if (this.actionType === 'update' && this.order) {
            return {
                client: this.order.client.id,
                seller: this.order.seller.id,
                order_items: this.order.order_items.map((item: any) => ({
                    id: item.id,
                    quantity: item.quantity,
                    returned_quantity: item.returned_quantity,
                    product: item.product.id,
                })),
            }
        }
    }

    populateOrderItems(orderItems: OrderItemEntity[]) {
        orderItems.forEach((orderItem: OrderItemEntity) => {
            this.orderItemsFormArray.push(
                this.formBuilder.group({
                    id: [orderItem.id],
                    quantity: [orderItem.quantity, Validators.required],
                    returned_quantity: [orderItem.returned_quantity, Validators.required],
                    product: [orderItem.product, Validators.required],
                })
            )
        })
    }

    calculateTotalOrderPrice(orderItems: any) {
        this.totalOrderPrice = 0

        if (orderItems.every((item: any) => item.quantity === '')) {
            return
        }

        for (const item of orderItems) {
            this.bakeryManagementService.getProductPriceById(item.product).subscribe((price) => {
                const productPrice = price
                this.totalOrderPrice += (item.quantity - item.returned_quantity) * productPrice
            })
        }
    }

    addNewOrderItem(): void {
        const newOrderItem = this.formBuilder.group({
            quantity: ['', Validators.required],
            returned_quantity: [0, Validators.required],
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
                error: (error: any) => {
                    console.log('There was an error deleting the order item:', error)
                },
            })
        }
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
        return !isEqual(this.currentQuestionData, this.orderForm.value)
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
            this.saveOrder.emit(this.orderForm.value)
            console.log('onSubmit', JSON.stringify(this.orderForm.value, null, 4))
        }
    }
}
