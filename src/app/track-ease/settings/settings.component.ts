import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatCard, MatCardContent } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatIcon } from '@angular/material/icon'
import { MatSlideToggle } from '@angular/material/slide-toggle'
import { FontService } from 'src/app/services/font.service'
import { ThemeService } from 'src/app/services/theme.service'

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: true,
    imports: [MatCard, MatCardContent, MatIcon, MatSlideToggle, FormsModule, MatChipsModule],
})
export class SettingsComponent implements OnInit {
    themeService = inject(ThemeService)
    fontService = inject(FontService)

    sendCreatedNotification = false
    sendUpdatedNotification = false

    isDarkModeEnabled = false

    selectedFontSize: number = 16
    fontSizes: number[] = [16, 24, 28, 32]

    ngOnInit(): void {
        this.isDarkModeEnabled = this.themeService.getTheme()
        this.selectedFontSize = this.fontService.getFontSize()
    }

    toggleTheme(): void {
        this.isDarkModeEnabled = !this.isDarkModeEnabled
        this.themeService.setTheme(this.isDarkModeEnabled)
    }

    changeFontSize(newFontSize: number): void {
        this.selectedFontSize = newFontSize
        this.fontService.setFontSize(this.selectedFontSize)
    }
}
