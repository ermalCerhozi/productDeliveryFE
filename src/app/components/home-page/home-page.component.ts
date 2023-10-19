import { AfterViewInit, Component, OnDestroy, QueryList, ViewChildren } from '@angular/core'
import { ElementRef } from '@angular/core'
import {
    animateRight,
    animateLeft,
    animateTop,
    animateBottom,
} from 'src/core/animations/animations'

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css'],
    animations: [animateRight, animateLeft, animateTop, animateBottom],
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
