import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatMenuModule } from '@angular/material/menu'

import { DropdownMenuListComponent } from 'src/trackEase/shared/components/dropdown-menu-list/dropdown-menu-list.component'

describe('DropdownMenuListComponent', () => {
    let component: DropdownMenuListComponent
    let fixture: ComponentFixture<DropdownMenuListComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [MatMenuModule, DropdownMenuListComponent],
}).compileComponents()

        fixture = TestBed.createComponent(DropdownMenuListComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    // describe('onDropdownMenuClick', () => {
    //     it('should emit menuClick', () => {
    //         const option = { label: 'label', icon: 'icon' }
    //         const event = new MouseEvent('click')
    //         const spy = jest.spyOn(component.menuClick, 'emit')

    //         component.onDropdownMenuClick(option, event)

    //         expect(spy).toHaveBeenCalledWith({ option, event })
    //     })
    // })
})
