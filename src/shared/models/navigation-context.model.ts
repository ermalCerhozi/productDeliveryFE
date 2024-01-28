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
    client?: string
    seller?: string
    minPrice?: number
    maxPrice?: number
    queryString?: string
    active?: boolean
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
