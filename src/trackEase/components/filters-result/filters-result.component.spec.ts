import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { FiltersResultComponent } from 'src/trackEase/components/filters-result/filters-result.component'
// import { MockRender } from 'ng-mocks'

describe('FiltersResultComponent', () => {
    let component: FiltersResultComponent
    let fixture: ComponentFixture<FiltersResultComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FiltersResultComponent],
            providers: [FormBuilder],
        }).compileComponents()

        fixture = TestBed.createComponent(FiltersResultComponent)
        component = fixture.componentInstance

        component.form = new FormGroup({
            fields: new FormControl<string[]>([]),
        })

        fixture.detectChanges()
    })

    it('should instantiate FiltersResultComponent successfully', () => {
        expect(component).toBeTruthy()
    })

    // describe('clearResults', () => {
    //     it('should emit clearResults when clearFilters is called', () => {
    //         jest.spyOn(component.clearResults, 'emit')
    //         component.clearFilters()
    //         expect(component.clearResults.emit).toHaveBeenCalled()
    //     })
    // })

    // describe('ngOnChanges', () => {
    //     it('should set form value when ngOnChanges is called', () => {
    //         const fixture = MockRender(FiltersResultComponent, {
    //             results: ['img'],
    //         })

    //         const component = fixture.point.componentInstance
    //         expect(component).toBeDefined()
    //         jest.spyOn(component.form, 'patchValue')
    //         component.ngOnChanges({
    //             results: new SimpleChange(null, ['img', 'video'], false),
    //         })
    //         fixture.detectChanges()
    //         expect(component.form.value.results.includes('video')).toBeTruthy()
    //         expect(component.form.patchValue).toHaveBeenCalledTimes(1)
    //         component.ngOnChanges({
    //             results: new SimpleChange(['img', 'video'], ['img', 'video', 'audio'], false),
    //         })
    //         fixture.detectChanges()
    //         expect(component.form.value.results.includes('audio')).toBeTruthy()
    //         expect(component.form.patchValue).toHaveBeenCalledTimes(2)
    //     })
    // })

    // describe('onRemoveFilter', () => {
    //     it('should emit removeFilter when onRemoveFilter is called', () => {
    //         const fixture = MockRender(FiltersResultComponent, {
    //             results: [
    //                 { value: 'img', label: 'IMG' },
    //                 { value: 'video', label: 'VIDEO' },
    //             ],
    //         })
    //         const component = fixture.point.componentInstance
    //         expect(component).toBeDefined()
    //         jest.spyOn(component.removeFilter, 'emit')
    //         component.onRemoveFilter({ value: 'img', label: 'IMG' })
    //         expect(component.form.value.results.includes({ value: 'img', label: 'IMG' })).not.toBe(
    //             true
    //         )
    //         expect(component.form.value.results.includes({ value: 'video', label: 'VIDEO' })).toBe(
    //             false
    //         )
    //         expect(component.removeFilter.emit).toHaveBeenCalled()
    //     })
    // })
})
