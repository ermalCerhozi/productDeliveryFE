import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from 'src/app/app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MaterialModule } from 'src/app/material.mudule'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { LoginComponent } from 'src/app/components/AUTH/login/login.component'
import { SignInComponent } from 'src/app/components/AUTH/sign-in/sign-in.component'
import { AppRoutingModule } from 'src/app/app-routing.module'
import { ProductsListComponent } from 'src/app/components/products-list/products-list.component'

@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        LoginComponent,
        SignInComponent,
        ProductsListComponent,
    ],
    imports: [BrowserModule, BrowserAnimationsModule, MaterialModule, AppRoutingModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
