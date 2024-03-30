import { FilterOption } from 'src/app/shared/models/filter-option.model'

export interface MediaLibraryNavigationContext {
    pagination: Pagination
    filters: Filters
    sorts: Sorts
    searchOptions: SearchOptions
    count?: boolean
    projectLocation?: boolean // remove when intuitive browsing becomes default ml
}

export interface Pagination {
    offset: number
    limit: number
}

export interface Filters {
    active: boolean
    type?: string[]
    queryString?: string
    format?: string[]
    size?: string[]
    date: string
    id?: string
    missingLongDescription?: boolean
    missingAltText?: boolean
    projectIds?: string[]
    categories?: string[]
    projects?: FilterOption[]
}

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export interface Sorts {
    [key: string]: SortDirection
}

export interface SearchOptions {
    title: boolean
    all: boolean
}

export interface Exclude {
    [key: string]: string
}
