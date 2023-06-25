import { NgModule, inject } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { ProductsComponent } from 'src/app/components/products/products.component'
import { OrdersComponent } from 'src/app/components/orders/orders.component'
import { ManageUsersComponent } from 'src/app/components/manage-users/manage-users.component'
import { ManageOrdersComponent } from 'src/app/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/components/manage-products/manage-products.component'
import { NotFoundComponent } from 'src/app/components/not-found/not-found.component'
import { LoginComponent } from 'src/app/components/AUTH/login/login.component'
import { LayoutComponent } from 'src/app/components/layout/layout.component'
// import { AuthGuard } from 'src/app/services/auth-guard.service'

const routes: Routes = [
    { path: '', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'home',
                component: HomePageComponent,
                // canActivate: [() => inject(AuthGuard).canActivate()],
            },
            { path: 'orders', component: OrdersComponent },
            { path: 'products-list', component: ProductsComponent },
            { path: 'manageOrders', component: ManageOrdersComponent },
            { path: 'manageProducts', component: ManageProductsComponent },
            { path: 'manageUsers', component: ManageUsersComponent },
        ],
    },
    { path: '**', component: NotFoundComponent },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
