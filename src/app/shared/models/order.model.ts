import { ProductEntity } from 'src/app/shared/models/product.model'
import { UserEntity } from 'src/app/shared/models/user.model'

export interface OrderResponse {
    orders: OrderEntity[]
    count: number
}

export interface OrderEntity {
    created_at: string
    updated_at: string
    id: number
    total_price: string
    client: UserEntity
    seller: UserEntity
    order_items: OrderItemEntity[]
}

export interface OrderItemEntity {
    id: number
    quantity: number
    returned_quantity: number
    product: ProductEntity
}
