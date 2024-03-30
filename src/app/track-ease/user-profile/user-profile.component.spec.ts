import { ComponentFixture, TestBed } from '@angular/core/testing'

import { UserProfileComponent } from 'src/trackEase/components/user-profile/user-profile.component'

describe('UserProfileComponent', () => {
    let component: UserProfileComponent
    let fixture: ComponentFixture<UserProfileComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserProfileComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(UserProfileComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})