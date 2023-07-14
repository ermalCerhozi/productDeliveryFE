import { Injectable } from '@angular/core'
import { Observable, tap } from 'rxjs'
import { FiltersEntity } from 'src/core/models/filters.model'
import { OrderEntity } from 'src/core/models/order.model'
import { ProductEntity } from 'src/core/models/product.model'
import { UserEntity } from 'src/core/models/user.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementService {
    public ordersList: OrderEntity[] = []

    constructor(private bakeryManagementApiService: BakeryManagementApiService) {}

    getFilteredResults(filters: FiltersEntity): void {
        const params: any = {}

        if (filters.startDate) {
            params.startDate = filters.startDate
        }
        if (filters.endDate) {
            params.endDate = filters.endDate
        }
        if (filters.client) {
            params.clientId = filters.client.id
        }
        if (filters.seller) {
            params.sellerId = filters.seller.id
        }

        this.bakeryManagementApiService.getFilteredOrders(params).subscribe((res) => {
            this.ordersList = res
            console.log('res', res)
        })
    }

    updateOrdersList(): Observable<OrderEntity[]> {
        return this.bakeryManagementApiService.getOrders().pipe(
            tap((res) => {
                this.ordersList = res
            })
        )
    }

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
