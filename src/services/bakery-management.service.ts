import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementService {
    constructor(private bakeryManagementApiService: BakeryManagementApiService) {}

    getAllProducts(): Observable<ProductEntity[]> {
        return this.bakeryManagementApiService.getProducts()
    }

    getAllUsers(): Observable<UserEntity[]> {
        return this.bakeryManagementApiService.getUsers()
    }

    deleteOrderItem(id: number): Observable<any> {
        return this.bakeryManagementApiService.deleteOrderItem(id)
    }
}
