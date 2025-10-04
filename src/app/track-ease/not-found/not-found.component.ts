import { Component } from '@angular/core'

import { MatButton } from '@angular/material/button'

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    standalone: true,
    imports: [MatButton],
})
export class NotFoundComponent {
    goBack() {
        window.history.back()
    }
}
