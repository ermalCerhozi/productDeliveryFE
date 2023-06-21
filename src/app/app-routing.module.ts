import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from 'src/app/components/home-page/home-page.component'
import { ProductsListComponent } from 'src/app/components/products-list/products-list.component'

const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'products-list', component: ProductsListComponent },
    // other routes here
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
