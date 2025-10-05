import { Component, inject } from '@angular/core'

import { CdkScrollable } from '@angular/cdk/scrolling'
import { MatButton } from '@angular/material/button'
import {
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MAT_DIALOG_DATA,
    MatDialogRef,
} from '@angular/material/dialog'
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco'

export interface ConfirmationDialogData {
    title: string | number
    message?: string
    displayOkButton?: boolean
    displayCancelButton?: boolean
    confirmButtonText?: string
    cancelButtonText?: string
}

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
        TranslocoDirective,
    ],
})
export class ConfirmationDialogComponent {
    private dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>)
    data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA)
    translocoService = inject(TranslocoService)
    
    title = this.data.title
    message = this.data.message || ''
    displayOkButton = this.data.displayOkButton ?? true
    displayCancelButton = this.data.displayCancelButton ?? true
    confirmButtonText = this.data.confirmButtonText || this.translocoService.translate('okay')
    cancelButtonText = this.data.cancelButtonText || this.translocoService.translate('cancel')

    onConfirm(): void {
        this.dialogRef.close(true)
    }

    onCancel(): void {
        this.dialogRef.close(false)
    }
}
