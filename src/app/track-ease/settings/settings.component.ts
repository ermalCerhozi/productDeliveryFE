import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { MatCard, MatCardContent } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatIcon } from '@angular/material/icon'
import { MatSlideToggle } from '@angular/material/slide-toggle'

import { FontService } from 'src/app/services/font.service'
import { NotificationService } from 'src/app/services/notification.service'
import { ThemeService } from 'src/app/services/theme.service'

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    imports: [MatCard, MatCardContent, MatIcon, MatSlideToggle, FormsModule, MatChipsModule]
})
export class SettingsComponent implements OnInit {
    themeService = inject(ThemeService)
    fontService = inject(FontService)
    notificationService = inject(NotificationService)

    sendCreatedNotification = false
    sendUpdatedNotification = false
    sendDeletedNotification = false

    isDarkModeEnabled = false

    optionFontSize: number = 16
    optionFontSizes: number[] = [16, 20, 24, 28]

    tableFontSize: number = 16
    tableFontSizes: number[] = [14, 16, 18]

    inputFontSize: number = 16
    inputFontSizes: number[] = [14, 16, 20, 24]

    ngOnInit(): void {
        this.isDarkModeEnabled = this.themeService.getTheme()

        this.optionFontSize = this.fontService.optionFontSize
        this.tableFontSize = this.fontService.tableFontSize
        this.inputFontSize = this.fontService.inputFontSize

        this.sendCreatedNotification = this.notificationService.sendCreatedNotification
        this.sendUpdatedNotification = this.notificationService.sendUpdatedNotification
        this.sendDeletedNotification = this.notificationService.sendDeletedNotification
    }

    toggleTheme(): void {
        this.isDarkModeEnabled = !this.isDarkModeEnabled
        this.themeService.setTheme(this.isDarkModeEnabled)
    }

    changeFontSize(mode: 'option' | 'table' | 'input', size: number): void {
        switch (mode) {
            case 'option':
                this.optionFontSize = size
                this.fontService.setFontSize('option', this.optionFontSize)
                break
            case 'table':
                this.tableFontSize = size
                this.fontService.setFontSize('table', this.tableFontSize)
                break
            case 'input':
                this.inputFontSize = size
                this.fontService.setFontSize('input', this.inputFontSize)
                break
            default:
                console.warn(`Unknown mode: ${mode}`)
        }
    }

    toggleNotifications(event: any, type: string): void {
        if (type === 'created') {
            this.notificationService.setBooleanToLocalStorage(
                'send-created-notification',
                this.sendCreatedNotification
            )
        } else if (type === 'updated') {
            this.notificationService.setBooleanToLocalStorage(
                'send-updated-notification',
                this.sendUpdatedNotification
            )
        } else if (type === 'deleted') {
            this.notificationService.setBooleanToLocalStorage(
                'send-deleted-notification',
                this.sendDeletedNotification
            )
        }
    }
}
