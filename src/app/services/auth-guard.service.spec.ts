import { TestBed } from '@angular/core/testing'

import { AuthGuardService } from 'src/app/services/auth-guard.service'

describe('AuthGuardService', () => {
    let service: AuthGuardService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(AuthGuardService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
