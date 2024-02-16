import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from 'src/app/app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MaterialModule } from 'src/app/material.module'
import { SharedModule } from 'src/app/shared/shared.module'
import { SignInComponent } from 'src/app/track-ease/sign-in/sign-in.component'
import { AppRoutingModule } from 'src/app/app-routing.module'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { HomePageComponent } from 'src/app/track-ease/home-page/home-page.component'
import { ManageOrdersComponent } from 'src/app/track-ease/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/track-ease/manage-products/manage-products.component'
import { ManageUsersComponent } from 'src/app/track-ease/manage-users/manage-users.component'
import { NotFoundComponent } from 'src/app/track-ease/not-found/not-found.component'
import { FormsModule } from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms'
import { LayoutComponent } from 'src/app/track-ease/layout-toolbar/layout.component'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
import { CreateUpdateOrdersComponent } from 'src/app/track-ease/create-update-orders/create-update-orders.component'
import { FiltersResultComponent } from 'src/app/track-ease/filters-result/filters-result.component'
import { UserProfileComponent } from 'src/app/track-ease/user-profile/user-profile.component'
import { ChangePasswordComponent } from 'src/app/track-ease/change-password/change-password.component'
import { SettingsComponent } from 'src/app/track-ease/settings/settings.component'
import * as PlotlyJS from 'plotly.js-dist-min'
import { PlotlyModule } from 'angular-plotly.js'
import { LocalStorageService } from 'ngx-webstorage'
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor'
import { HapiErrorInterceptor } from 'src/app/interceptors/auth-error.interceptor'

PlotlyModule.plotlyjs = PlotlyJS

@NgModule({
    declarations: [
        AppComponent,
        SignInComponent,
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
    providers: [
        LocalStorageService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HapiErrorInterceptor,
            multi: true,
        },
    ],

    bootstrap: [AppComponent],
})
export class AppModule {}
