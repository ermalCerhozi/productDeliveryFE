import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdvancedTextFilterComponent } from 'src/app/shared/components/filters/advanced-text-filter/advanced-text-filter.component'

describe('AdvancedTextFilterComponent', () => {
    let component: AdvancedTextFilterComponent
    let fixture: ComponentFixture<AdvancedTextFilterComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [AdvancedTextFilterComponent],
}).compileComponents()

        fixture = TestBed.createComponent(AdvancedTextFilterComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
