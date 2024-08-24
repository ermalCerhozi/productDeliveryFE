import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from 'src/app/track-ease/home-page/home-page.component'
import { ManageUsersComponent } from 'src/app/track-ease/manage-users/manage-users.component'
import { ManageOrdersComponent } from 'src/app/track-ease/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/track-ease/manage-products/manage-products.component'
import { NotFoundComponent } from 'src/app/track-ease/not-found/not-found.component'
import { SignInComponent } from 'src/app/track-ease/sign-in/sign-in.component'
import { LayoutComponent } from 'src/app/track-ease/layout-toolbar/layout.component'
import { AuthGuard } from 'src/app/services/auth-guard.service'
import { PermissionsGuard } from 'src/app/services/permissions-guard.service'
import { UserProfileComponent } from 'src/app/track-ease/user-profile/user-profile.component'
import { SettingsComponent } from 'src/app/track-ease/settings/settings.component'

const routes: Routes = [
    {
        path: '',
        component: SignInComponent,
    },
    {
        path: '',
        component: LayoutComponent,
        // canActivateChild: [AuthGuard], //AuthGuard will be applied to all child routes.
        children: [
            {
                path: 'homePage',
                component: HomePageComponent,
                // canActivate: [PermissionsGuard],
                // data: { expectedRoles: ['Admin', 'Manager', 'Seller'] },
            },
            {
                path: 'manageOrders',
                component: ManageOrdersComponent,
                // canActivate: [PermissionsGuard],
                // data: { expectedRoles: ['Admin', 'Manager'] },
            },
            {
                path: 'manageProducts',
                component: ManageProductsComponent,
                // canActivate: [PermissionsGuard],
                // data: { expectedRoles: ['Admin'] },
            },
            {
                path: 'manageUsers',
                component: ManageUsersComponent,
                // canActivate: [PermissionsGuard],
                // data: { expectedRoles: ['Admin'] },
            },
            {
                path: 'profile',
                component: UserProfileComponent,
                // canActivate: [PermissionsGuard],
                // data: { expectedRoles: ['Admin', 'Manager', 'Seller'] },
            },
            {
                path: 'settings',
                component: SettingsComponent,
                // canActivate: [PermissionsGuard],
                // data: { expectedRoles: ['Admin', 'Manager', 'Seller'] },
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
