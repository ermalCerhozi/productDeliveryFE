export interface LoginModel {
    phoneNumber: string //TODO: convert it into a number insted of a string
    password: string
}

export interface UserResponse {
    users: UserEntity[]
    count: number
}

export interface UserEntity {
    id: number
    created_at: string
    updated_at: string
    first_name: string
    last_name: string
    nickname: string
    phone_number: string
    role: string
    email: string
    location: string
    profile_picture?: string
    password?: string
}

export interface changeUserPassword {
    actualPassword: string
    newPassword: string
    confirmPassword: string
}
