import { Injectable } from '@angular/core'
import { Observable, tap, BehaviorSubject } from 'rxjs'
import { OrderEntity, OrderResponse } from 'src/shared/models/order.model'
import { ProductEntity, ProductResponse } from 'src/shared/models/product.model'
import { UserEntity, UserResponse } from 'src/shared/models/user.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { NavigationContext } from 'src/shared/models/navigation-context.model'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementService {
    private ordersListSubject: BehaviorSubject<OrderEntity[]> = new BehaviorSubject<OrderEntity[]>(
        []
    )
    public ordersList$: Observable<OrderEntity[]> = this.ordersListSubject.asObservable()

    private productsListSubject: BehaviorSubject<ProductEntity[]> = new BehaviorSubject<
        ProductEntity[]
    >([])
    public productsList$: Observable<ProductEntity[]> = this.productsListSubject.asObservable()

    private usersListSubject: BehaviorSubject<UserEntity[]> = new BehaviorSubject<UserEntity[]>([])
    public usersList$: Observable<UserEntity[]> = this.usersListSubject.asObservable()

    public productsCount!: number
    public ordersCount!: number
    public usersCount!: number
    public navigationContext!: NavigationContext

    constructor(private bakeryManagementApiService: BakeryManagementApiService) {
        this.getBaseNavigationContext()
    }

    getBaseNavigationContext(): void {
        this.navigationContext = {
            pagination: {
                offset: 0,
                limit: 21,
            },
            filters: {},
            // sorts: {
            //     $created_at: SortDirection.DESC,
            // },
            searchOptions: {
                title: true,
                all: false,
            },
            getCount: true,
        }
    }

    updateProductList(append?: boolean): Observable<ProductResponse> {
        if (!append) {
            this.productsListSubject.next([])
            this.navigationContext.pagination.limit = 21
            this.navigationContext.pagination.offset = 0
        }

        const requestPayload: { navigation_context: NavigationContext } = {
            // workspace_id: this.localStorageService.retrieve('workspaceId'),
            navigation_context: this.navigationContext,
        }

        return this.bakeryManagementApiService.searchProduct(requestPayload).pipe(
            tap((response: ProductResponse) => {
                console.log('Products fetched:', response.products.length)
                let newProductsList
                if (append) {
                    newProductsList = [...this.productsListSubject.getValue(), ...response.products]
                } else {
                    newProductsList = response.products
                }
                this.productsListSubject.next(newProductsList)

                this.navigationContext.pagination.offset += this.navigationContext.pagination.limit
                if (this.navigationContext.getCount) {
                    this.productsCount = response.count
                }
            })
        )
    }

    updateOrdersList(append: boolean): Observable<OrderResponse> {
        console.log('Navigation context:', this.navigationContext)
        if (!append) {
            this.productsListSubject.next([])
            this.navigationContext.pagination.limit = 21
            this.navigationContext.pagination.offset = 0
        }

        const requestPayload: { navigation_context: NavigationContext } = {
            // workspace_id: this.localStorageService.retrieve('workspaceId'),
            navigation_context: this.navigationContext,
        }

        return this.bakeryManagementApiService.getFilteredOrders(requestPayload).pipe(
            tap((response: OrderResponse) => {
                console.log('Orders fetched:', response.orders.length)
                let newOrdersList
                if (append) {
                    newOrdersList = [...this.ordersListSubject.getValue(), ...response.orders]
                } else {
                    newOrdersList = response.orders
                }
                this.ordersListSubject.next(newOrdersList)

                this.navigationContext.pagination.offset += this.navigationContext.pagination.limit
                if (this.navigationContext.getCount) {
                    this.ordersCount = response.count
                }
            })
        )
    }

    updateUsersList(append: boolean): Observable<UserResponse> {
        if (!append) {
            this.usersListSubject.next([])
            this.navigationContext.pagination.limit = 21
            this.navigationContext.pagination.offset = 0
        }

        const requestPayload: { navigation_context: NavigationContext } = {
            // workspace_id: this.localStorageService.retrieve('workspaceId'),
            navigation_context: this.navigationContext,
        }

        return this.bakeryManagementApiService.searchUsers(requestPayload).pipe(
            tap((response: UserResponse) => {
                console.log('Users fetched:', response.users.length)
                let newUsersList
                if (append) {
                    newUsersList = [...this.usersListSubject.getValue(), ...response.users]
                } else {
                    newUsersList = response.users
                }
                this.usersListSubject.next(newUsersList)
                this.usersListSubject.next(newUsersList)

                this.navigationContext.pagination.offset += this.navigationContext.pagination.limit
                if (this.navigationContext.getCount) {
                    this.usersCount = response.count
                }
            })
        )
    }

    getAllUsers(): Observable<UserEntity[]> {
        return this.bakeryManagementApiService.getUsers()
    }

    getLoggedInUser() {
        return JSON.parse(localStorage.getItem('currentUser') || '')
    }

    // hasActiveFilters(item: string): boolean {
    //     switch (item) {
    //         case 'product':
    //         // return Object.keys(this.navigationContext.productFilters).length > 0
    //         case 'order':
    //         // return Object.keys(this.navigationContext.orderFilters).length > 0
    //         default:
    //             return false
    //     }
    // }

    deleteOrderItem(id: number): Observable<any> {
        return this.bakeryManagementApiService.deleteOrderItem(id)
    }

    clearFilters(): void {
        this.getBaseNavigationContext()
        // this.updateProductList(false).subscribe()
    }

    getAllProducts(): Observable<ProductEntity[]> {
        return this.bakeryManagementApiService.getProducts()
    }

    // TODO: Move this implementation to the back end
    downloadSelected(selection: any) {
        // Create a new jsPDF instance
        const doc = new jsPDF()

        // Build an array with the information of the selected rows
        let total_price = 0 // Initialize total_price
        const data = selection.selected.map((row: any, index: number) => {
            const itemDetails = row.order_items.map((item: any) => ({
                order_item: `${item.quantity} ${item.product?.product_name}`,
                order_return: `${item.returned_quantity}`,
            }))

            const order_items = itemDetails.map((item: any) => item.order_item).join('\n')
            const order_returns = itemDetails.map((item: any) => item.order_return).join('\n')

            total_price += Number(row.total_price) // Calculate the total_price
            return [
                index + 1, // Auto-incremented column
                row.id,
                row.seller.first_name + ' ' + row.seller.last_name,
                row.client.first_name + ' ' + row.client.last_name,
                order_items,
                order_returns,
                // this.formatDatePipe.transform(row.created_at),
                // this.formatTimePipe.transform(row.created_at),
                Math.round(row.total_price).toLocaleString() + ' ' + 'Lekë',
            ]
        })

        // Insert column titles
        data.unshift([
            '#',
            'ORDER ID',
            'Seller',
            'Client',
            'Order',
            'Returns',
            'Date',
            'Time',
            'Price',
        ])

        // Insert a row with the total price
        data.push([
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            'Total',
            Math.round(total_price).toLocaleString() + ' ' + 'Lekë',
        ])

        // Use autoTable to generate a table
        autoTable(doc, {
            head: [data.shift()], // Use the first row as header
            body: data,
            theme: 'striped',
            styles: { cellWidth: 'wrap' },
            columnStyles: { text: { cellWidth: 'auto' } },
        })

        // Add additional text
        doc.setFontSize(10) // Set font size to match the rest of the document
        const text =
            'If you want to see your orders in real time or you want to view product pricing you can visit:'
        const url = 'https://asdfasdf'
        const posY = doc.internal.pageSize.height - 20

        // Write the text
        doc.setTextColor(0)
        doc.text(text, 10, posY)

        // Get the width of the text to position the link
        const textWidth = doc.getTextWidth(text)

        // Write the link
        doc.setTextColor(0, 0, 255)
        doc.text(url, 10 + textWidth, posY)

        // Draw the underline for the link
        const urlWidth = doc.getTextWidth(url)
        doc.setDrawColor(0, 0, 255)
        doc.line(10 + textWidth, posY + 1, 10 + textWidth + urlWidth, posY + 1)

        // Make the text clickable
        doc.link(10 + textWidth, posY - 1, urlWidth, 1, { url })

        // Save the PDF
        doc.save('selected_orders.pdf')
    }
}
