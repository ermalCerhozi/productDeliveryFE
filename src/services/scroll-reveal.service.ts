// scroll-reveal.service.ts
import { Injectable } from '@angular/core'
// @ts-ignore
import ScrollReveal from 'scrollreveal'

@Injectable({
    providedIn: 'root',
})
export class ScrollRevealService {
    private sr = ScrollReveal()

    reveal(element: string, config: any) {
        this.sr.reveal(element, config)
    }
}
