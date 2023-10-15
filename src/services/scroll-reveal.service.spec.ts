import { TestBed } from '@angular/core/testing'

import { ScrollRevealService } from 'src/services/scroll-reveal.service'

describe('ScrollRevealService', () => {
    let service: ScrollRevealService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(ScrollRevealService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
