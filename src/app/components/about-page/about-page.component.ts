import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    QueryList,
    ViewChildren,
} from '@angular/core'
import {
    animateRight,
    animateLeft,
    animateTop,
    animateBottom,
} from 'src/core/animations/animations'

@Component({
    selector: 'app-about-page',
    templateUrl: './about-page.component.html',
    styleUrls: ['./about-page.component.css'],
    animations: [animateRight, animateLeft, animateTop, animateBottom],
})
export class AboutPageComponent implements AfterViewInit, OnDestroy {
    @ViewChildren('animatedElement', { read: ElementRef }) animatedElements!: QueryList<ElementRef>
    elementStates: { [key: string]: 'hidden' | 'visible' } = {}
    animationsMapping: string[] = ['animateRight', 'animateTop', 'animateBottom', 'animateLeft']
    show = false

    ngAfterViewInit() {
        this.animatedElements.forEach((_, index) => {
            this.elementStates[`element${index}`] = 'hidden'
        })
        // setTimeout(() => {
        //     this.checkViewportElements()
        // })
        window.addEventListener('scroll', this.scroll, true)
    }

    toggleShow() {
        this.show = !this.show
    }

    ngOnDestroy() {
        window.removeEventListener('scroll', this.scroll, true)
    }

    checkViewportElements = (): void => {
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

    scroll = (): void => {
        this.checkViewportElements()
    }
}
