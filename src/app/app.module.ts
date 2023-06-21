import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.mudule';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginComponent } from './components/AUTH/login/login.component';
import { SignInComponent } from './components/AUTH/sign-in/sign-in.component';
import { AppRoutingModule } from './app-routing.module';
import { ProductsListComponent } from './components/products-list/products-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    LoginComponent,
    SignInComponent,
    ProductsListComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
