export interface ImageUploadRequest {
    fileName: string
    contentType: string
    data: string
    userId?: number
}

export interface ImageResponse {
    id: number
    fileName: string
    contentType: string
    data: string
    userId?: number
}
