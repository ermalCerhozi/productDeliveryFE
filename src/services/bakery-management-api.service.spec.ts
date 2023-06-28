import { TestBed } from '@angular/core/testing'

import { BakeryManagementApiService } from 'src/services/bakery-management-api.service'

describe('MakeryManagementApiService', () => {
    let service: BakeryManagementApiService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(BakeryManagementApiService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
