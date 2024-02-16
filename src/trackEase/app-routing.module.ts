import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from 'src/trackEase/components/home-page/home-page.component'
import { ManageUsersComponent } from 'src/trackEase/components/manage-users/manage-users.component'
import { ManageOrdersComponent } from 'src/trackEase/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/trackEase/components/manage-products/manage-products.component'
import { NotFoundComponent } from 'src/trackEase/components/not-found/not-found.component'
import { signInSignUpComponent } from 'src/trackEase/components/SignInSignUp/signInSignUp.component'
import { LayoutComponent } from 'src/trackEase/components/layout-toolbar/layout.component'
import { AuthGuard } from 'src/trackEase/services/auth-guard.service'
import { PermissionsGuard } from 'src/trackEase/services/permissions-guard.service'
import { UserProfileComponent } from 'src/trackEase/components/user-profile/user-profile.component'
import { SettingsComponent } from 'src/trackEase/components/settings/settings.component'

const routes: Routes = [
    {
        path: '',
        component: signInSignUpComponent,
    },
    {
        path: '',
        component: LayoutComponent,
        canActivateChild: [AuthGuard], //AuthGuard will be applied to all child routes.
        children: [
            {
                path: 'homePage',
                component: HomePageComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Manager', 'Seller'] },
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
            {
                path: 'profile',
                component: UserProfileComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Manager', 'Seller'] },
            },
            {
                path: 'settings',
                component: SettingsComponent,
                canActivate: [PermissionsGuard],
                data: { expectedRoles: ['Admin', 'Manager', 'Seller'] },
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
