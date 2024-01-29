import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.css'],
})
export class ConfirmationDialogComponent {
    @Input() title!: string | number
    @Output() confirm = new EventEmitter()

    onConfirm(): void {
        this.confirm.emit()
    }
}
