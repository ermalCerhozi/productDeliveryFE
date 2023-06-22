import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateUpdateProductDialogComponent } from 'src/app/modals/create-product-dialog/create-update-product-dialog.component'

describe('CreateProductDialogComponent', () => {
    let component: CreateUpdateProductDialogComponent
    let fixture: ComponentFixture<CreateUpdateProductDialogComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateUpdateProductDialogComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(CreateUpdateProductDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
