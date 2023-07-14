//an interface in TypeScript is a way to ensure a particular structure for an object,
//while a class is a blueprint for creating objects with specific properties and behaviors

export interface LoginModel {
    phoneNumber: string //TODO: convert it into a number insted of a string
    password: string
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
    password?: string
}
