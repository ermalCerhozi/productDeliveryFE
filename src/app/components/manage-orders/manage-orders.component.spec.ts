import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ManageOrdersComponent } from 'src/app/components/manage-orders/manage-orders.component'

describe('ManageOrdersComponent', () => {
    let component: ManageOrdersComponent
    let fixture: ComponentFixture<ManageOrdersComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ManageOrdersComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(ManageOrdersComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
