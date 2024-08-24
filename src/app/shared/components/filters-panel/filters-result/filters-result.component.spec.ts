import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FiltersResultComponent } from 'src/app/shared/components/filters-panel/filters-result/filters-result.component'

describe('FiltersResultComponent', () => {
    let component: FiltersResultComponent
    let fixture: ComponentFixture<FiltersResultComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FiltersResultComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(FiltersResultComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
