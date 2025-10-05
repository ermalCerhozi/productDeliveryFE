import { Component } from '@angular/core'

import { MatButton } from '@angular/material/button'
import { TranslocoDirective } from '@jsverse/transloco'

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    imports: [MatButton, TranslocoDirective]
})
export class NotFoundComponent {
    goBack() {
        window.history.back()
    }
}
