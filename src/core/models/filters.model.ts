import { UserEntity } from 'src/core/models/user.model'

export interface FiltersEntity {
    startDate?: Date
    endDate?: Date
    client?: UserEntity
    seller?: UserEntity
}
