import { ExternalUrlSanitizerPipe } from 'src/shared/common/pipes/external-url-sanitizer.pipe'
import { DomSanitizer } from '@angular/platform-browser'

describe('ExternalUrlSanitizerPipe', () => {
    let sanitizer: DomSanitizer
    let pipe: ExternalUrlSanitizerPipe

    beforeEach(() => {
        // sanitizer = {
        //     bypassSecurityTrustResourceUrl: jest.fn(),
        // } as unknown as DomSanitizer

        pipe = new ExternalUrlSanitizerPipe(sanitizer)
    })

    it('create an instance', () => {
        expect(pipe).toBeTruthy()
    })

    it('should return sanitized URL if the input URL is valid', () => {
        const url = 'https://www.example.com'
        pipe.transform(url)
        expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(url)
    })

    it('should return default URL if the input URL is invalid', () => {
        const url = 'invalid url'
        const defaultUrl = 'assets/images/page-not-found.png'
        pipe.transform(url)
        expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(defaultUrl)
    })
})
