export interface ProductResponse {
    products: ProductEntity[]
    hasMoreItems: boolean
}

export interface ProductEntity {
    id: number
    product_name: string
    price: string
    description: string
    image: string
    ingredients: string
}
