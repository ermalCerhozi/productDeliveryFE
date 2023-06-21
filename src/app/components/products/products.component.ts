import { Component, OnInit } from '@angular/core'
import { Product } from 'src/app/models/product'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
    products: Product[] | undefined
    constructor(private bakeryManagementApiService: BakeryManagementApiService) {}

    ngOnInit() {
        this.bakeryManagementApiService.getProducts().subscribe((products) => {
            this.products = products
        })
    }
}
