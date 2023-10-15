import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core'
import { trigger, state, style, animate, transition } from '@angular/animations'

@Component({
    selector: 'app-about-page',
    templateUrl: './about-page.component.html',
    styleUrls: ['./about-page.component.css'],
    animations: [
        // Animate Right
        trigger('animateRight', [
            state('hidden', style({ transform: 'translateX(25rem)', opacity: 0 })),
            state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
            transition('hidden => visible', [animate('1s 600ms')]),
        ]),

        // Animate Left
        trigger('animateLeft', [
            state('hidden', style({ transform: 'translateX(-25rem)', opacity: 0 })),
            state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
            transition('hidden => visible', [animate('1s 300ms')]),
        ]),

        // Animate Top
        trigger('animateTop', [
            state('hidden', style({ transform: 'translateY(-25rem)', opacity: 0 })),
            state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
            transition('hidden => visible', [animate('1s 600ms')]),
        ]),

        // Animate Bottom
        trigger('animateBottom', [
            state('hidden', style({ transform: 'translateY(25rem)', opacity: 0 })),
            state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
            transition('hidden => visible', [animate('1s 600ms')]),
        ]),
    ],
})
export class AboutPageComponent implements AfterViewInit, OnDestroy {
    elementStates: { [key: string]: 'hidden' | 'visible' } = {
        animateRight: 'hidden',
        animateTop: 'hidden',
        animateBottom: 'hidden',
        animateLeft: 'hidden',
    }

    constructor(private el: ElementRef) {}

    ngAfterViewInit() {
        window.addEventListener('scroll', this.scroll, true)
    }

    ngOnDestroy() {
        window.removeEventListener('scroll', this.scroll, true)
    }

    scroll = (): void => {
        console.log('Scroll event detected')
        const keys = Object.keys(this.elementStates)
        keys.forEach((key) => {
            const componentPosition = this.el.nativeElement.offsetTop
            const scrollPosition = window.pageYOffset + window.innerHeight
            if (scrollPosition >= componentPosition) {
                this.elementStates[key] = 'visible'
            } else {
                this.elementStates[key] = 'hidden'
            }
        })
    }
}
