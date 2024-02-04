import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { ManageUsersComponent } from 'src/app/components/manage-users/manage-users.component'
import { ManageOrdersComponent } from 'src/app/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/components/manage-products/manage-products.component'
import { NotFoundComponent } from 'src/app/components/not-found/not-found.component'
import { signInSignUpComponent } from 'src/app/components/SignInSignUp/signInSignUp.component'
import { LayoutComponent } from 'src/app/components/layout-toolbar/layout.component'
import { AuthGuard } from 'src/services/auth-guard.service'
import { PermissionsGuard } from 'src/services/permissions-guard.service'
import { UserProfileComponent } from 'src/app/components/user-profile/user-profile.component'
import { SettingsComponent } from 'src/app/components/settings/settings.component'

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
