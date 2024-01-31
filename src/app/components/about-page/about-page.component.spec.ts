import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AboutPageComponent } from 'src/app/components/about-page/about-page.component'

describe('AboutPageComponent', () => {
    let component: AboutPageComponent
    let fixture: ComponentFixture<AboutPageComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AboutPageComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(AboutPageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
