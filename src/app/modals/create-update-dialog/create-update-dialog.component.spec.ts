import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateUpdateDialogComponent } from 'src/app/modals/create-update-dialog/create-update-dialog.component'

describe('CreateProductDialogComponent', () => {
    let component: CreateUpdateDialogComponent
    let fixture: ComponentFixture<CreateUpdateDialogComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateUpdateDialogComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(CreateUpdateDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
