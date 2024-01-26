// TODO: Remove from optional when full implementation is done
export interface NavigationContext {
    pagination: Pagination
    filters?: Filters
    sorts?: Sorts
    searchOptions?: SearchOptions
    filteredCount?: boolean
}

interface Pagination {
    offset: number
    limit: number
}

interface Filters {
    active: boolean
    date: string
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
