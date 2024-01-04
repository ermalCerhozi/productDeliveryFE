import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProductsTableListComponent } from 'src/app/components/products-table-list/products-table-list.component'

describe('ProductsTableListComponent', () => {
    let component: ProductsTableListComponent
    let fixture: ComponentFixture<ProductsTableListComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProductsTableListComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(ProductsTableListComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
