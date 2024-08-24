import { ComponentFixture, TestBed } from '@angular/core/testing'

import { OrdersComponent } from 'src/trackEase/components/home-page/home-page.component'

describe('OrdersComponent', () => {
    let component: OrdersComponent
    let fixture: ComponentFixture<OrdersComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [OrdersComponent],
}).compileComponents()

        fixture = TestBed.createComponent(OrdersComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
