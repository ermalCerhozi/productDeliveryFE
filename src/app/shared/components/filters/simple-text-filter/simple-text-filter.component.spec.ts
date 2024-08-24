import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SimpleTextFilterComponent } from 'src/app/shared/components/filters/simple-text-filter/simple-text-filter.component'

describe('SimpleTextFilterComponent', () => {
    let component: SimpleTextFilterComponent
    let fixture: ComponentFixture<SimpleTextFilterComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleTextFilterComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(SimpleTextFilterComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
