import { ComponentFixture, TestBed } from '@angular/core/testing'

import { signInSignUpComponent } from 'src/app/components/AUTH/SignInSignUp/signInSignUp.component'

describe('LoginComponent', () => {
    let component: signInSignUpComponent
    let fixture: ComponentFixture<signInSignUpComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [signInSignUpComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(signInSignUpComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
