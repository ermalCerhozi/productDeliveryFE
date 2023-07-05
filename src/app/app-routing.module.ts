import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { ProductsComponent } from 'src/app/components/products/products.component'
import { OrdersComponent } from 'src/app/components/orders/orders.component'
import { ManageUsersComponent } from 'src/app/components/manage-users/manage-users.component'
import { ManageOrdersComponent } from 'src/app/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/components/manage-products/manage-products.component'
import { NotFoundComponent } from 'src/app/components/not-found/not-found.component'
import { LoginComponent } from 'src/app/components/AUTH/login/login.component'
import { LayoutComponent } from 'src/app/components/layout-toolbar/layout.component'
import { AuthGuard } from 'src/services/auth-guard.service'
import { PermissionsGuard } from 'src/services/permissions-guard.service'

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivateChild: [AuthGuard], //AuthGuard will be applied to all child routes.
        children: [
            {
                path: '',
                component: HomePageComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Manager', 'Seller', 'Client'] },
            },
            {
                path: 'orders',
                component: OrdersComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Manager', 'Seller'] },
            },
            {
                path: 'products-list',
                component: ProductsComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Manager', 'Seller', 'Client'] },
            },
            {
                path: 'manageOrders',
                component: ManageOrdersComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Manager'] },
            },
            {
                path: 'manageProducts',
                component: ManageProductsComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin'] },
            },
            {
                path: 'manageUsers',
                component: ManageUsersComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin'] },
            },
        ],
    },
    { path: '**', component: NotFoundComponent },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
