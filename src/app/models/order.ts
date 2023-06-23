import { Product } from 'src/app/models/product'
import { User } from 'src/app/models/user'

export interface OrderItem {
    id: number
    quantity: number
    product: Product
}

export interface Order {
    id: number
    order_date: string
    client: User
    seller: User
    order_items: OrderItem[]
}
