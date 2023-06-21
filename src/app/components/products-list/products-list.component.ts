import { Component } from '@angular/core';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {

  products = [
    {
      "id": 1,
      "product_name": "Masive >",
      "price": "80.00"
    },
    {
      "id": 2,
      "product_name": "Masive <",
      "price": "35.00"
    },
    {
      "id": 3,
      "product_name": "Simite",
      "price": "55.00"
    },
    {
      "id": 4,
      "product_name": "Natyrale",
      "price": "55.00"
    },
    {
      "id": 5,
      "product_name": "Misri",
      "price": "55.00"
    }
  ];


}
