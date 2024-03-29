// TODO: Remove from optional when full implementation is done
export interface NavigationContext {
    pagination: Pagination
    filters: Filters
    sorts?: Sorts
    searchOptions: SearchOptions
    getCount: boolean
}

interface Pagination {
    offset: number
    limit: number
}

export interface Filters {
    date?: string
    startDate?: string
    endDate?: string
    clientId?: number
    sellerId?: number
    minPrice?: number
    maxPrice?: number
    queryString?: string
    active?: boolean
    [key: string]: string | number | boolean | undefined
}

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

interface Sorts {
    $created_at: SortDirection
}

export interface SearchOptions {
    title: boolean
    all: boolean
}
