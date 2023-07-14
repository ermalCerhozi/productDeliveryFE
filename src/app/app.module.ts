import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from 'src/app/app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MaterialModule } from 'src/app/material.module'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { LoginComponent } from 'src/app/components/AUTH/login/login.component'
import { SignInComponent } from 'src/app/components/AUTH/sign-in/sign-in.component'
import { AppRoutingModule } from 'src/app/app-routing.module'
import { HttpClientModule } from '@angular/common/http'
import { ProductsComponent } from 'src/app/components/products/products.component'
import { OrdersComponent } from 'src/app/components/orders/orders.component'
import { ManageOrdersComponent } from 'src/app/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/components/manage-products/manage-products.component'
import { ManageUsersComponent } from 'src/app/components/manage-users/manage-users.component'
import { NotFoundComponent } from 'src/app/components/not-found/not-found.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'
import { ReactiveFormsModule } from '@angular/forms'
import { LayoutComponent } from 'src/app/components/layout-toolbar/layout.component'
import { FilterDialogComponent } from 'src/app/modals/filter-dialog/filter-dialog.component'
import { FormatDatePipe } from 'src/core/common/pipes/format-date.pipe'

@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        LoginComponent,
        SignInComponent,
        ProductsComponent,
        OrdersComponent,
        ManageOrdersComponent,
        ManageProductsComponent,
        ManageUsersComponent,
        NotFoundComponent,
        ConfirmationDialogComponent,
        CreateUpdateDialogComponent,
        LayoutComponent,
        FilterDialogComponent,
        FormatDatePipe,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
    ],
    providers: [FormatDatePipe],
    bootstrap: [AppComponent],
})
export class AppModule {}
