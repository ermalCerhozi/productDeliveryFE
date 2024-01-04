import { UserEntity } from 'src/shared/models/user.model'

export interface FiltersEntity {
    startDate?: Date
    endDate?: Date
    client?: UserEntity
    seller?: UserEntity
}
