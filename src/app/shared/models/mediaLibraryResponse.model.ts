// import { Media } from '@app/media-library/models/Medias' //TODO: move here the Users and produts with UserResult and ProductResult interfaces

export interface CountDates {
    'any-time': number
    'last-12months': number
    'last-30days': number
    'last-7days': number
    'last-72h': number
    'last-48h': number
    'last-24h': number
}

// export interface CountType {
//     group: string
//     reduction: number
// }

export interface Count {
    countDates?: CountDates
    // countTypes?: CountType[]
}

// export interface MediaResult {
//     results: Media[]
//     count: Count
//     filteredMediaCount: number
// }

export interface UserFiltersResponse {
    id: string
    first_name: string
    last_name: string
    mediaCount: number
}

export interface ProductsFiltersResponse {
    id: string
    product_name: string
    price: number
}
