import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateUpdateOrdersComponent } from 'src/trackEase/components/create-update-orders/create-update-orders.component'

describe('CreateUpdateOrdersComponent', () => {
    let component: CreateUpdateOrdersComponent
    let fixture: ComponentFixture<CreateUpdateOrdersComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateUpdateOrdersComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(CreateUpdateOrdersComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
