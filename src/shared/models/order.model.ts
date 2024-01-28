import { ProductEntity } from 'src/shared/models/product.model'
import { UserEntity } from 'src/shared/models/user.model'

export interface OrderResponse {
    orders: OrderEntity[]
    count: number
}

export interface OrderEntity {
    id: number
    created_at: string
    updated_at: string
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
