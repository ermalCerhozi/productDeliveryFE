import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from 'src/trackEase/app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MaterialModule } from 'src/trackEase/material.module'
import { SharedModule } from 'src/trackEase/shared/shared.module'
import { signInSignUpComponent } from 'src/trackEase/components/SignInSignUp/signInSignUp.component'
import { AppRoutingModule } from 'src/trackEase/app-routing.module'
import { HttpClientModule } from '@angular/common/http'
import { HomePageComponent } from 'src/trackEase/components/home-page/home-page.component'
import { ManageOrdersComponent } from 'src/trackEase/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/trackEase/components/manage-products/manage-products.component'
import { ManageUsersComponent } from 'src/trackEase/components/manage-users/manage-users.component'
import { NotFoundComponent } from 'src/trackEase/components/not-found/not-found.component'
import { FormsModule } from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms'
import { LayoutComponent } from 'src/trackEase/components/layout-toolbar/layout.component'
import { FilterDialogComponent } from 'src/trackEase/modals/filter-dialog/filter-dialog.component'
import { CreateUpdateOrdersComponent } from 'src/trackEase/components/create-update-orders/create-update-orders.component'
import { FiltersResultComponent } from 'src/trackEase/components/filters-result/filters-result.component'
import { UserProfileComponent } from 'src/trackEase/components/user-profile/user-profile.component'
import { ChangePasswordComponent } from 'src/trackEase/components/change-password/change-password.component'
import { SettingsComponent } from 'src/trackEase/components/settings/settings.component'
import * as PlotlyJS from 'plotly.js-dist-min'
import { PlotlyModule } from 'angular-plotly.js'

PlotlyModule.plotlyjs = PlotlyJS

@NgModule({
    declarations: [
        AppComponent,
        signInSignUpComponent,
        HomePageComponent,
        ManageOrdersComponent,
        ManageProductsComponent,
        ManageUsersComponent,
        NotFoundComponent,
        LayoutComponent,
        FilterDialogComponent,
        CreateUpdateOrdersComponent,
        FiltersResultComponent,
        UserProfileComponent,
        ChangePasswordComponent,
        SettingsComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        SharedModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        PlotlyModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
