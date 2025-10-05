import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class WhatsAppInvoiceService {
    sendInvoiceOnWhatsApp(order: any) {
        const phone = order.client.phone_number.replace('+', '') // make sure it’s in international format
        const message = this.formatInvoice(order)
        const encoded = encodeURIComponent(message)
        const url = `https://wa.me/${phone}?text=${encoded}`
        window.open(url, '_blank')
    }

    formatInvoice(order: any): string {
        // Format date and time
        const date = new Date(order.created_at || order.date || Date.now())
        const formattedDate = date.toLocaleDateString('sq-AL')
        const formattedTime = date.toLocaleTimeString('sq-AL', {
            hour: '2-digit',
            minute: '2-digit',
        })
        const klienti = order.client?.first_name || 'Klient'
        const shitësi = order.seller?.first_name || 'Shitës'

        let text = `🧾 Fatura: ${formattedDate} ${formattedTime}\nKlienti: ${klienti}\nShitësi: ${shitësi}\n\n`
        text += `Artikulli     Sasia   Totali\n`
        text += `--------------------------\n`

        order.order_items.forEach((orderItem: any) => {
            const name = orderItem.product.product_name.padEnd(12)
            const returnedQty = orderItem.returned_quantity || 0
            let qty: string
            if (returnedQty && returnedQty > 0) {
                qty = `(${orderItem.quantity}-${returnedQty})`.padEnd(7)
            } else {
                qty = String(orderItem.quantity).padEnd(7)
            }
            const total = `${Math.round(parseFloat(orderItem.order_item_total_price))}L`
            text += `${name}${qty}${total}\n`
        })

        text += `--------------------------\n`
        text += `TOTAL               ${Math.round(parseFloat(order.total_price))}L`
        return text
    }
}
