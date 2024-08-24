import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SimpleRadioSelectFilterComponent } from 'src/app/shared/components/filters/simple-radio-select-filter/simple-radio-select-filter.component'

describe('SimpleRadioSelectFilterComponent', () => {
    let component: SimpleRadioSelectFilterComponent
    let fixture: ComponentFixture<SimpleRadioSelectFilterComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleRadioSelectFilterComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(SimpleRadioSelectFilterComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
