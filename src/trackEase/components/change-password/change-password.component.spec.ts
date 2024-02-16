import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ChangePasswordComponent } from 'src/trackEase/components/change-password/change-password.component'

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent
    let fixture: ComponentFixture<ChangePasswordComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChangePasswordComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(ChangePasswordComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
