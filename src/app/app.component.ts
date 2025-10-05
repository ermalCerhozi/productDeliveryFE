import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'

import { ThemeService } from './services/theme.service'
import { FontService } from './services/font.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [RouterOutlet],
})
export class AppComponent {
    themeService = inject(ThemeService)
    fontService = inject(FontService)
}
