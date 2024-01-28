import { TestBed } from '@angular/core/testing'

import { MediaLibrarySearchServiceService } from './media-library-search-service.service'

describe('MediaLibrarySearchServiceService', () => {
    let service: MediaLibrarySearchServiceService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(MediaLibrarySearchServiceService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
