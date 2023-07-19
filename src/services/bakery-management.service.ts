import { Injectable } from '@angular/core'
import { Observable, tap } from 'rxjs'
import { FiltersEntity } from 'src/core/models/filters.model'
import { OrderEntity } from 'src/core/models/order.model'
import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FormatDatePipe } from 'src/core/common/pipes/format-date.pipe'
import { FormatTimePipe } from 'src/core/common/pipes/format-time.pipe'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementService {
    public ordersList: OrderEntity[] = []

    constructor(
        private bakeryManagementApiService: BakeryManagementApiService,
        private formatDatePipe: FormatDatePipe,
        private formatTimePipe: FormatTimePipe
    ) {}

    getFilteredResults(filters: FiltersEntity): void {
        const params: any = {}

        if (filters.startDate) {
            params.startDate = filters.startDate
        }
        if (filters.endDate) {
            params.endDate = filters.endDate
        }
        if (filters.client) {
            params.clientId = filters.client.id
        }
        if (filters.seller) {
            params.sellerId = filters.seller.id
        }

        this.bakeryManagementApiService.getFilteredOrders(params).subscribe((res) => {
            this.ordersList = res
            console.log('res', res)
        })
    }

    updateOrdersList(): Observable<OrderEntity[]> {
        return this.bakeryManagementApiService.getOrders().pipe(
            tap((res) => {
                this.ordersList = res
            })
        )
    }

    getAllProducts(): Observable<ProductEntity[]> {
        return this.bakeryManagementApiService.getProducts()
    }

    getAllUsers(): Observable<UserEntity[]> {
        return this.bakeryManagementApiService.getUsers()
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.bakeryManagementApiService.deleteOrderItem(id)
    }

    downloadSelected(selection: any) {
        // Create a new jsPDF instance
        const doc = new jsPDF()

        // Build an array with the information of the selected rows
        let total_price = 0 // Initialize total_price
        const data = selection.selected.map((row: any, index: number) => {
            const order_items = row.order_items
                .map((item: any) => `${item.quantity} ${item.product?.product_name}`)
                .join('\n')
            total_price += Number(row.total_price) // Calculate the total_price
            return [
                index + 1, // Auto-incremented column
                row.id,
                row.seller.first_name + ' ' + row.seller.last_name,
                row.client.first_name + ' ' + row.client.last_name,
                order_items,
                this.formatDatePipe.transform(row.created_at),
                this.formatTimePipe.transform(row.created_at),
                Math.round(row.total_price).toLocaleString() + ' ' + 'Lekë',
            ]
        })

        // Insert column titles
        data.unshift(['#', 'ORDER ID', 'Seller', 'Client', 'Order', 'Date', 'Time', 'Price'])

        // Insert a row with the total price
        data.push([
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
