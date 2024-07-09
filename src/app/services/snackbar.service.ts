import { Injectable } from '@angular/core'
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar'

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    private horizontalPosition: MatSnackBarHorizontalPosition = 'end'
    private verticalPosition: MatSnackBarVerticalPosition = 'top'
    private duration = 3000

    constructor(private _snackBar: MatSnackBar) {}

    public showSuccess(message: string) {
        this._snackBar.open(message, 'Close', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.duration,
            panelClass: ['snack-bar-success'],
        })
    }

    public dismiss() {
        this._snackBar.dismiss()
    }

    public showError(message = 'Error'): void {
        this._snackBar.open(message, 'Close', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.duration,
            panelClass: ['snack-bar-error'],
        })
    }
}
