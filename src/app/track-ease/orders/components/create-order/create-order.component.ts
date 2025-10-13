import {
    Component,
    inject,
    signal,
    computed,
    effect,
    DestroyRef,
    ViewChild,
} from '@angular/core'
import {
    FormArray,
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import { Router } from '@angular/router'
import { AsyncPipe } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

import { Subscription, debounceTime, fromEvent, map } from 'rxjs'
import { cloneDeep, isEqual } from 'lodash-es'
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { MatMiniFabButton, MatFabButton, MatButton } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import { MatDialogActions } from '@angular/material/dialog'
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'

import { OrderItemEntity } from 'src/app/shared/models/order.model'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { SnackBarService } from 'src/app/services/snackbar.service'
import { NotificationService } from 'src/app/services/notification.service'
import { WhatsAppInvoiceService } from 'src/app/whats-app-invoice.service'
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco'
import { UserFiltersResponse, ProductsFiltersResponse } from 'src/app/shared/models/mediaLibraryResponse.model'

@Component({
    selector: 'app-create-order',
    templateUrl: './create-order.component.html',
    styleUrls: ['./create-order.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        MatError,
        MatMiniFabButton,
        MatIcon,
        MatFabButton,
        MatDialogActions,
        MatButton,
        TranslocoDirective,
    ],
})
export class CreateUpdateOrdersComponent {
    @ViewChild('autoCompleteProducts') autoCompleteProducts!: MatAutocomplete
    @ViewChild('autoCompleteClients') autoCompleteClients!: MatAutocomplete
    private scrollSubscription!: Subscription

    private destroyRef = inject(DestroyRef);
    private formBuilder = inject(FormBuilder);
    private bakeryManagementApiService = inject(BakeryManagementApiService);
    private snackBarService = inject(SnackBarService);
    private router = inject(Router);
    private notificationService = inject(NotificationService);
    private whatsAppInvoiceService = inject(WhatsAppInvoiceService);
    private translocoService = inject(TranslocoService);

    // Client state - using signals
    public clients = signal<FilterOption[]>([]);
    public clientsLoading = signal<boolean>(false);
    public hasMoreClientsToLoad = signal<boolean>(true);
    public clientSearchQuery = '';

    // Product state - using signals
    public products = signal<FilterOption[]>([]);
    public productsLoading = signal<boolean>(false);
    public hasMoreProductsToLoad = signal<boolean>(true);
    public productSearchQuery = '';

    // Form state
    public orderForm: FormGroup = new FormGroup({});
    public orderItemsFormArray!: FormArray;
    public previousOrders = signal<number>(0);
    private currentOrder!: any;

    // Signal to track form array values for reactive computed signals
    public orderItemsSignal = signal<any[]>([]);

    // Computed filtered products based on selected items
    public filteredProducts = computed<FilterOption[]>(() => {
        const orderItems = this.orderItemsSignal();
        const selectedProductsMap = new Map<any, FilterOption>();

        orderItems.forEach((item: any) => {
            if (item.product?.value) {
                selectedProductsMap.set(item.product.value, item.product);
            }
        });

        return this.products().filter(
            product => !selectedProductsMap.has(product.value)
        );
    });

    // Computed total order price
    public totalOrderPrice = computed<number>(() => {
        const orderItems = this.orderItemsSignal();
        const validOrderItems = orderItems.filter(
            (item: any) => item.product && (item.quantity || item.returned_quantity)
        );

        return validOrderItems.reduce((total: number, item: any) => {
            const quantity = item.quantity ?? 0;
            const returnedQuantity = item.returned_quantity ?? 0;
            return total + item.product.price * (quantity - returnedQuantity);
        }, 0);
    });

    constructor() {
        // Initialize form
        this.patchForm();

        // Load initial data
        this.loadMoreClients();
        this.loadMoreProducts();

        // Store initial form state for change detection
        setTimeout(() => {
            this.currentOrder = cloneDeep(this.orderForm.value);
        });

        // Subscribe to form array changes and update the signal
        this.orderItemsFormArray.valueChanges.pipe(
            debounceTime(60),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
            this.orderItemsSignal.set(this.orderItemsFormArray.value);
        });
    }

    patchForm() {
        const formData = this.getCreateOrderFormData()

        this.orderForm = this.formBuilder.group({
            client: [formData.client, Validators.required],
            seller: [formData.seller, Validators.required],
            order_items: this.formBuilder.array([]),
        })

        this.orderItemsFormArray = this.orderForm.get('order_items') as FormArray
        this.populateOrderItems(formData.order_items)

        this.orderItemsSignal.set(this.orderItemsFormArray.value);
    }

    getCreateOrderFormData(): any {
        return {
            client: '',
            seller: JSON.parse(localStorage.getItem('currentUser') || ''),
            order_items: [{ quantity: '', returned_quantity: '', product: '' }],
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
                    quantity: [orderItem.quantity, Validators.required],
                    returned_quantity: [orderItem.returned_quantity],
                    product: [orderItem.product, Validators.required],
                })
            )
        })
    }

    getPreviousClientOrders() {
        this.previousOrders.update(prev => prev + 1);

        const clientId = this.orderForm.get('client')!.value.value;
        this.bakeryManagementApiService
            .getPreviousOrderByClient(clientId, this.previousOrders())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    const transformedOrderItems = this.transformedOrderItems(res.order_items);
                    this.orderItemsFormArray.clear();
                    this.populateOrderItems(transformedOrderItems);
                    this.orderItemsSignal.set(this.orderItemsFormArray.value);
                },
                error: (error: Error) => {
                    this.previousOrders.update(prev => prev - 1);
                    console.log('There was an error getting the last order:', error);
                },
            });
    }

    getNextClientOrders() {
        if (this.previousOrders() > 0) {
            this.previousOrders.update(prev => prev - 1);
            const clientId = this.orderForm.get('client')!.value.value;
            this.bakeryManagementApiService
                .getPreviousOrderByClient(clientId, this.previousOrders())
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (res) => {
                        const transformedOrderItems = this.transformedOrderItems(res.order_items);
                        this.orderItemsFormArray.clear();
                        this.populateOrderItems(transformedOrderItems);
                        this.orderItemsSignal.set(this.orderItemsFormArray.value);
                    },
                    error: (error: Error) => {
                        this.previousOrders.update(prev => prev + 1);
                        console.error('There was an error getting the next order:', error);
                    },
                });
        }
    }

    addNewOrderItem(): void {
        const newOrderItem = this.formBuilder.group({
            quantity: ['', Validators.required],
            returned_quantity: [''],
            product: ['', Validators.required],
        })

        this.orderItemsFormArray.push(newOrderItem)
        this.orderItemsSignal.set(this.orderItemsFormArray.value);
    }

    removeOrderItem(index: number): void {
        const orderItemId = this.orderItemsFormArray.at(index).value.id
        if (orderItemId) {
            this.bakeryManagementApiService.deleteOrderItem(orderItemId).subscribe({
                next: () => {
                    this.orderItemsFormArray.removeAt(index)
                    this.orderItemsSignal.set(this.orderItemsFormArray.value);
                },
                error: (error: Error) => {
                    console.log('There was an error deleting the order item:', error)
                },
            })
        } else {
            // If the order item doesn't have an ID, it means it hasn't been saved to the server yet.
            // So we can just remove it from the form array.
            this.orderItemsFormArray.removeAt(index)
            this.orderItemsSignal.set(this.orderItemsFormArray.value);
        }
    }

    displayFn(option: any): string {
        return option.label;
    }

    clientSearchChange(event: any): void {
        const inputValue = (event.target as HTMLInputElement).value;
        this.clientSearchQuery = inputValue;
        this.clients.set([]);
        this.hasMoreClientsToLoad.set(true);
        this.getPaginatedClients();
    }

    loadMoreClients(): void {
        this.getPaginatedClients();
    }

    productSearchChange(event: any): void {
        const inputValue = (event.target as HTMLInputElement).value;
        this.productSearchQuery = inputValue;
        this.products.set([]);
        this.hasMoreProductsToLoad.set(true);
        this.getPaginatedProducts();
    }

    loadMoreProducts(): void {
        this.getPaginatedProducts();
    }

    formHasChanged(): boolean {
        return !isEqual(this.currentOrder, this.orderForm.value);
    }

    // This function is triggered when the autocomplete panel is opened.
    // It creates a subscription to the scroll event of the autocomplete panel.
    // The debounceTime(200) is used to limit the number of events triggered.
    onOpened(autoComplete: MatAutocomplete) {
        setTimeout(() => {
            if (autoComplete && autoComplete.panel) {
                if (autoComplete.panel) {
                    this.scrollSubscription = fromEvent(
                        autoComplete.panel.nativeElement,
                        'scroll'
                    ).subscribe((e) => this.onScroll(e, autoComplete));
                } else {
                    console.error('autoComplete.panel is still undefined');
                }
            }
        }, 10);
    }

    // This function is triggered when the autocomplete panel is closed.
    // It checks if there is a subscription to the scroll event and if so, it unsubscribes from it.
    // This is done to prevent memory leaks.
    onClosed() {
        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe();
        }
    }

    // This function is triggered when the autocomplete panel is scrolled.
    // It checks if the end of the panel is reached by comparing the scroll position with the total scroll height.
    // If the end is reached and there are more clients to load (hasMoreClientsToLoad is true),
    // it calls the loadMoreClients() function to load more clients.
    onScroll(event: any, autoComplete: MatAutocomplete) {
        if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
            if (autoComplete === this.autoCompleteProducts && this.hasMoreProductsToLoad()) {
                this.loadMoreProducts();
            } else if (autoComplete === this.autoCompleteClients && this.hasMoreClientsToLoad()) {
                this.loadMoreClients();
            }
        }
    }

    save(): void {
        if (this.orderForm.valid) {
            const formValue = this.orderForm.value;
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
            };
            const params = {
                newValue,
                sendCreatedNotification: this.notificationService.sendCreatedNotification,
            };

            this.bakeryManagementApiService
                .createOrder(params)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (createdOrder) => {
                        this.snackBarService.showSuccess(
                            this.translocoService.translate('createOrder.createdSuccessfully') as string
                        );
                        this.whatsAppInvoiceService.sendInvoiceOnWhatsApp(createdOrder);
                        this.goBack();
                    },
                    error: (error) => {
                        console.log('Error: ', error);
                        this.goBack();
                    },
                });
        }
    }

    goBack(): void {
        this.router.navigate(['/orders']);
    }

    // Private methods for pagination
    private getPaginatedClients(): void {
        this.clientsLoading.set(true);
        const payload: any = {
            pagination: {
                offset: this.clients().length,
                limit: 20,
            },
        };
        if (this.clientSearchQuery) {
            payload.clientName = this.clientSearchQuery;
        }

        this.bakeryManagementApiService
            .getClientFiltersForOrder(payload)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                map((clientList: UserFiltersResponse[]) => {
                    this.hasMoreClientsToLoad.set(clientList.length !== 0);
                    this.addClientsToSelectionList(clientList);
                    this.clientsLoading.set(false);
                })
            )
            .subscribe();
    }

    private getPaginatedProducts(): void {
        this.productsLoading.set(true);
        const payload: any = {
            pagination: {
                offset: this.products().length,
                limit: 20,
            },
        };
        if (this.productSearchQuery) {
            payload.productName = this.productSearchQuery;
        }

        this.bakeryManagementApiService
            .getProductFiltersForOrder(payload)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                map((productList: ProductsFiltersResponse[]) => {
                    this.hasMoreProductsToLoad.set(productList.length !== 0);
                    this.addProductsToSelectionList(productList);
                    this.productsLoading.set(false);
                })
            )
            .subscribe();
    }

    private addClientsToSelectionList(clientList: UserFiltersResponse[]): void {
        const newClients: FilterOption[] = [];
        clientList.forEach((client) =>
            newClients.push({
                value: client.id,
                label: client.first_name + ' ' + client.last_name,
                count: client.mediaCount,
            })
        );
        this.clients.update(current => [...current, ...newClients]);
    }

    private addProductsToSelectionList(productList: ProductsFiltersResponse[]): void {
        const newProducts: FilterOption[] = [];
        productList.forEach((product) =>
            newProducts.push({
                value: product.id,
                label: product.product_name,
                price: product.price,
            })
        );
        this.products.update(current => [...current, ...newProducts]);
    }
}
