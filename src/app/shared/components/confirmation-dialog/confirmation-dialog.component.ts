import { Component, input, output } from '@angular/core'

import { CdkScrollable } from '@angular/cdk/scrolling'
import { MatButton } from '@angular/material/button'
import {
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog'
import { TranslocoDirective } from '@jsverse/transloco'

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
        TranslocoDirective
    ]
})
export class ConfirmationDialogComponent {
    title = input.required<string | number>()
    confirm = output<void>()

    onConfirm(): void {
        this.confirm.emit()
    }
}
