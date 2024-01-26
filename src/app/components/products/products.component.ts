import { Component, OnInit } from '@angular/core'
import { ProductEntity } from 'src/shared/models/product.model'
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
        // TODO: Implement pagination or just leave as is to display only some of the available items
        // this.bakeryManagementApiService.getProducts(0, 20).subscribe((res) => {
        //     this.products = res.products
        // })
    }

    toggleShow() {
        this.show = !this.show
    }
}
