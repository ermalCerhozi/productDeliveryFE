import { Component, input, output } from '@angular/core'

import { CdkScrollable } from '@angular/cdk/scrolling'
import { MatButton } from '@angular/material/button'
import {
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog'

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class ConfirmationDialogComponent {
    title = input.required<string | number>()
    confirm = output<void>()

    onConfirm(): void {
        this.confirm.emit()
    }
}
