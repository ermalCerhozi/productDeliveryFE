export interface PermissionEntity {
    id: number
    created_at: string
    updated_at: string
    code: string
    description?: string | null
}

export interface CreatePermissionRequest {
    code: string
    description?: string | null
}
