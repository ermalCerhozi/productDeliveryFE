import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from 'src/app/app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MaterialModule } from 'src/app/material.mudule'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { LoginComponent } from 'src/app/components/AUTH/login/login.component'
import { SignInComponent } from 'src/app/components/AUTH/sign-in/sign-in.component'
import { AppRoutingModule } from 'src/app/app-routing.module'
import { HttpClientModule } from '@angular/common/http'
import { ProductsComponent } from 'src/app/components/products/products.component'
import { OrdersComponent } from 'src/app/components/orders/orders.component'
import { CreateOrderComponent } from 'src/app/components/create-order/create-order.component'
import { ManageOrdersComponent } from 'src/app/components/manage-orders/manage-orders.component'
import { ManageProductsComponent } from 'src/app/components/manage-products/manage-products.component'
import { ManageUsersComponent } from 'src/app/components/manage-users/manage-users.component'
import { NotFoundComponent } from 'src/app/components/not-found/not-found.component'
import { ConfirmationDialogComponent } from 'src/app/modals/confirmation-dialog/confirmation-dialog.component'
import { CreateUpdateProductDialogComponent } from 'src/app/modals/create-product-dialog/create-update-product-dialog.component'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        LoginComponent,
        SignInComponent,
        ProductsComponent,
        OrdersComponent,
        CreateOrderComponent,
        ManageOrdersComponent,
        ManageProductsComponent,
        ManageUsersComponent,
        NotFoundComponent,
        ConfirmationDialogComponent,
        CreateUpdateProductDialogComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
