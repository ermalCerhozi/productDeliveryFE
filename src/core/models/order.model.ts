import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'

export interface OrderItemEntity {
    id: number
    quantity: number
    product: ProductEntity
}

export interface OrderEntity {
    id: number
    created_at: string
    updated_at: string
    client: UserEntity
    seller: UserEntity
    order_items: OrderItemEntity[]
}
