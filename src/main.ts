import { enableProdMode, importProvidersFrom } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { environment } from 'src/environments/environment'
import { LocalStorageService } from 'ngx-webstorage'
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http'
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor'
import { HapiErrorInterceptor } from 'src/app/interceptors/auth-error.interceptor'
import { ApiInterceptor } from 'src/app/services/api.interceptor'
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'
import { AppRoutingModule } from 'src/app/app-routing.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AppComponent } from './app/app.component'

if (environment.production) {
    enableProdMode()
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule),
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
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiInterceptor,
            multi: true,
        },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
    ],
}).catch((err) => console.error(err))
