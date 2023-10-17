import { AfterViewInit, Component, OnDestroy, QueryList, ViewChildren } from '@angular/core'
import { ElementRef } from '@angular/core'
import { trigger, state, style, animate, transition } from '@angular/animations'

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css'],
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
            transition('hidden => visible', [animate('1s 200ms')]),
        ]),
    ],
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
    @ViewChildren('animatedElement', { read: ElementRef }) animatedElements!: QueryList<ElementRef>
    elementStates: { [key: string]: 'hidden' | 'visible' } = {}
    animationsMapping: string[] = ['animateRight', 'animateTop', 'animateBottom', 'animateLeft']

    ngAfterViewInit() {
        this.animatedElements.forEach((_, index) => {
            this.elementStates[`element${index}`] = 'hidden'
        })
        window.addEventListener('scroll', this.scroll, true)
    }

    ngOnDestroy() {
        window.removeEventListener('scroll', this.scroll, true)
    }

    scroll = (): void => {
        this.animatedElements.forEach((elRef, index) => {
            const elementPosition =
                elRef.nativeElement.getBoundingClientRect().top + window.pageYOffset
            const scrollPosition = window.pageYOffset + window.innerHeight

            if (
                scrollPosition >= elementPosition &&
                this.elementStates[`element${index}`] === 'hidden'
            ) {
                this.elementStates[`element${index}`] = 'visible'
            }
        })
    }
}
