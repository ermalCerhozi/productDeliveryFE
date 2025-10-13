export interface ImageUploadRequest {
    fileName: string
    contentType: string
    data: string
    userId?: number
    productId?: number
}

export interface ImageResponse {
    id: number
    fileName: string
    contentType: string
    data: string
    userId?: number
    productId?: number
}
