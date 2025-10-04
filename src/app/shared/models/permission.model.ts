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

export interface AssignPermissionsRequest {
    permissionCodes: string[]
}

export type RoleName = 'Admin' | 'Manager' | 'Seller' | 'Client'

export interface RolePermissionsSummary {
    id: number
    name: RoleName
    permissionCodes: string[]
}
