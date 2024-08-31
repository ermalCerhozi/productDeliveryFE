import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NotFoundComponent } from 'src/app/track-ease/not-found/not-found.component'
import { SignInComponent } from 'src/app/track-ease/sign-in/sign-in.component'
import { LayoutComponent } from 'src/app/track-ease/layout-toolbar/layout.component'
import { AuthGuard } from './services/auth-guard.service'
import { PermissionsGuard } from './services/permissions-guard.service'
import { ORDERS_ROUTES } from './track-ease/orders/orders.component.routing'

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: SignInComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivateChild: [AuthGuard], //AuthGuard will be applied to all child routes.
        children: [
            {
                path: 'homePage',
                loadComponent: () =>
                    import('src/app/track-ease/home-page/home-page.component').then(
                        (c) => c.HomePageComponent
                    ),
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Client'] },
            },
            {
                path: 'manageOrders',
                loadComponent: () => import('src/app/track-ease/orders/orders.component').then((c) => c.OrdersComponent),
                children: ORDERS_ROUTES,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin'] },
            },
            {
                path: 'manageProducts',
                loadComponent: () =>
                    import('src/app/track-ease/manage-products/manage-products.component').then(
                        (c) => c.ManageProductsComponent
                    ),
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin'] },
            },
            {
                path: 'manageUsers',
                loadComponent: () =>
                    import('src/app/track-ease/manage-users/manage-users.component').then(
                        (c) => c.ManageUsersComponent
                    ),
                // canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin'] },
            },
            {
                path: 'profile',
                loadComponent: () =>
                    import('src/app/track-ease/user-profile/user-profile.component').then(
                        (c) => c.UserProfileComponent
                    ),
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin'] },
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('src/app/track-ease/settings/settings.component').then(
                        (c) => c.SettingsComponent
                    ),
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Client'] },
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
