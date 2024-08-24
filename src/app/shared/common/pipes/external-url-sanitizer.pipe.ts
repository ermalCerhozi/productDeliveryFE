import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

@Pipe({
    name: 'externalUrlSanitizer',
    pure: true,
    standalone: true,
})
export class ExternalUrlSanitizerPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(url: string): SafeResourceUrl {
        const urlRegex =
            /^(https:\/\/www\.)[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/ ~+#-]*[\w@?^=%&/~+#-])?$/

        if (urlRegex.test(url)) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(url)
        } else {
            const defaultUrl = 'assets/images/page-not-found.png'
            return this.sanitizer.bypassSecurityTrustResourceUrl(defaultUrl)
        }
    }
}
