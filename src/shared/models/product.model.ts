export interface ProductResponse {
    products: ProductEntity[]
    hasMoreItems: boolean
}

export interface ProductEntity {
    created_at: string
    id: number
    product_name: string
    price: string
    description: string
    image: string
    ingredients: string
}
