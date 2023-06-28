import { TestBed } from '@angular/core/testing'

import { PermissionsGuard } from 'src/services/permissions-guard.service'

describe('PermissionsGuardService', () => {
    let service: PermissionsGuard

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(PermissionsGuard)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
