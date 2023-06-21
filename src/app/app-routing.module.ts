import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { ProductsComponent } from 'src/app/components/products/products.component'
import { OrdersComponent } from 'src/app/components/orders/orders.component'
import { ManageUsersComponent } from 'src/app/components/manage-users/manage-users.component'
import { ManageOrdersComponent } from 'src/app/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/components/manage-products/manage-products.component'
import { NotFoundComponent } from 'src/app/components/not-found/not-found.component'

const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'users', component: OrdersComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'products-list', component: ProductsComponent },
    { path: 'manageOrders', component: ManageOrdersComponent },
    { path: 'manageProducts', component: ManageProductsComponent },
    { path: 'manageUsers', component: ManageUsersComponent },
    { path: '**', component: NotFoundComponent },
    // other routes here
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
