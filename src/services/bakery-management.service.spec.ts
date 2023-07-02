import { TestBed } from '@angular/core/testing'

import { BakeryManagementService } from 'src/services/bakery-management.service'

describe('BakeryManagementService', () => {
    let service: BakeryManagementService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(BakeryManagementService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
