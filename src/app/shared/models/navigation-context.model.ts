// TODO: Remove from optional when full implementation is done
import { FilterOption } from 'src/app/shared/models/filter-option.model'

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
    type?: string[]
    missingLongDescription?: boolean
    missingAltText?: boolean
    projectIds?: string[]
    projects?: FilterOption[]
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
