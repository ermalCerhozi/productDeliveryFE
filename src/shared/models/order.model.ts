import { ProductEntity } from 'src/shared/models/product.model'
import { UserEntity } from 'src/shared/models/user.model'

// TODO: add has more items
export interface OrderResponse {
    orders: OrderEntity[]
    hasMoreItems?: boolean
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
