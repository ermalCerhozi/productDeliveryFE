import { trigger, state, style, animate, transition } from '@angular/animations'

// Animate right
export const animateRight = trigger('animateRight', [
    state('hidden', style({ transform: 'translateX(25rem)', opacity: 0 })),
    state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
    transition('hidden => visible', [animate('1s cubic-bezier(0.0, 0.0, 0.2, 1)')]),
])

// Animate Left
export const animateLeft = trigger('animateLeft', [
    state('hidden', style({ transform: 'translateX(-25rem)', opacity: 0 })),
    state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
    transition('hidden => visible', [animate('1s cubic-bezier(0.0, 0.0, 0.2, 1)')]),
])

// Animate Top
export const animateTop = trigger('animateTop', [
    state('hidden', style({ transform: 'translateY(-25rem)', opacity: 0 })),
    state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
    transition('hidden => visible', [animate('1s cubic-bezier(0.0, 0.0, 0.2, 1)')]),
])

// Animate Bottom
export const animateBottom = trigger('animateBottom', [
    state('hidden', style({ transform: 'translateY(25rem)', opacity: 0 })),
    state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
    transition('hidden => visible', [animate('1s cubic-bezier(0.0, 0.0, 0.2, 1)')]),
])
