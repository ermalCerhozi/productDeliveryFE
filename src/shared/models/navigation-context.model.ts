// TODO: Remove from optional when full implementation is done
export interface NavigationContext {
    pagination: Pagination
    productFilters: ProductFilters
    orderFilters: OrderFilters
    sorts?: Sorts
    searchOptions?: SearchOptions
    getCount: boolean
}

interface Pagination {
    offset: number
    limit: number
}

interface ProductFilters {
    active?: boolean
    minPrice?: number
    maxPrice?: number
    search?: string
}

interface OrderFilters {
    active?: boolean
    client?: string
    seller?: string
    date?: string
    search?: string
}

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

interface Sorts {
    $created_at: SortDirection
}

interface SearchOptions {
    title: boolean
    metadata: boolean
}
