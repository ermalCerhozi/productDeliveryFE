import { Component, OnInit } from '@angular/core'
import { ProductEntity } from 'src/core/models/product.model'
import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
    products: ProductEntity[] | undefined
    constructor(private bakeryManagementApiService: BakeryManagementApiService) {}

    ngOnInit() {
        this.bakeryManagementApiService.getProducts().subscribe((products) => {
            this.products = products
        })
    }
}
