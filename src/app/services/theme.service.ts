import { Injectable, Renderer2, RendererFactory2 } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private renderer: Renderer2

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null)
        this.initializeTheme()
    }

    setTheme(isDarkModeEnabled: boolean): void {
        if (isDarkModeEnabled) {
            this.renderer.addClass(document.body, 'darkMode')
            localStorage.setItem('theme', 'dark')
        } else {
            this.renderer.removeClass(document.body, 'darkMode')
            localStorage.setItem('theme', 'light')
        }
    }

    getTheme(): boolean {
        let theme = localStorage.getItem('theme')
        if (!theme) {
            theme = 'light'
            localStorage.setItem('theme', theme)
        }
        return theme === 'dark'
    }

    private initializeTheme(): void {
        const theme = this.getTheme()
        this.setTheme(theme)
    }
}
