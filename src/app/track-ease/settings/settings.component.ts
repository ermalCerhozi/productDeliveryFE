import { Component, OnInit, Renderer2 } from '@angular/core'

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
    isDarkModeEnabled = false
    // TODO: Fix implement notifications
    checked!: boolean
    unCheck!: boolean

    constructor(private renderer: Renderer2) {}

    ngOnInit(): void {
        const theme = localStorage.getItem('theme')
        this.isDarkModeEnabled = theme === 'dark' ? true : false

        if (this.isDarkModeEnabled) {
            this.renderer.addClass(document.body, 'darkMode')
        } else {
            this.renderer.removeClass(document.body, 'darkMode')
        }
    }

    toggleTheme(): void {
        if (this.isDarkModeEnabled) {
            this.renderer.removeClass(document.body, 'darkMode')
            localStorage.setItem('theme', 'light')
        } else {
            this.renderer.addClass(document.body, 'darkMode')
            localStorage.setItem('theme', 'dark')
        }

        this.isDarkModeEnabled = !this.isDarkModeEnabled
    }
}
