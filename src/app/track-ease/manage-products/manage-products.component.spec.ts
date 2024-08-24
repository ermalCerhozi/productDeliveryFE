import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ManageProductsComponent } from 'src/trackEase/components/manage-products/manage-products.component'

describe('ManageProductsComponent', () => {
    let component: ManageProductsComponent
    let fixture: ComponentFixture<ManageProductsComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [ManageProductsComponent],
}).compileComponents()

        fixture = TestBed.createComponent(ManageProductsComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
