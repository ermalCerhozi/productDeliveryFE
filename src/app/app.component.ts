import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'

import { ThemeService } from './services/theme.service'
import { FontService } from './services/font.service'
import { getBrowserLang, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [RouterOutlet],
})
export class AppComponent {
    themeService = inject(ThemeService)
    fontService = inject(FontService)
    translocoService = inject(TranslocoService);

  constructor() {
    this.translocoService.setActiveLang(this.getDefaultLang());
  }

  private getDefaultLang(): string {
    const defaultLang = 'en';
    try {
      const browserLang = getBrowserLang();
      const availableLang = this.translocoService
        .getAvailableLangs()
        .find((value) => browserLang === value) as string;
      return availableLang ? availableLang : defaultLang;
    } catch (e) {
      return defaultLang;
    }
  }
}
