import { Component, EventEmitter, Input, Output } from '@angular/core'
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

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
    @Input() title!: string | number
    @Output() confirm = new EventEmitter()

    onConfirm(): void {
        this.confirm.emit()
    }
}
