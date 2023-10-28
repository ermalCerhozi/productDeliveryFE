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
    show = false

    constructor(private bakeryManagementApiService: BakeryManagementApiService) {}

    ngOnInit() {
        this.bakeryManagementApiService.getProducts().subscribe((res) => {
            this.products = res
        })
    }

    toggleShow() {
        this.show = !this.show
    }
}
