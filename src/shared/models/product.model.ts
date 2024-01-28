export interface ProductResponse {
    products: ProductEntity[]
    count: number
}

export interface ProductEntity {
    id: number
    product_name: string
    price: string
    description: string
    image: string
    created_at?: string
    ingredients?: string
}
