import { Component } from '@angular/core'

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
    actualPassword = ''
    newPassword = ''
    confirmNewPassword = ''

    showActualPassword = false
    showNewPassword = false
    showConfirmNewPassword = false

    // https://gist.github.com/djabif/4c7a6fab751d1fdfe6c7b63e9e7fdea9
    // validationMessages = {
    //     password: [
    //         { type: 'required', message: 'Please, protect your account with a password.' },
    //         { type: 'minlength', message: 'Your password must be at least 5 characters long.' },
    //     ],
    //     confirmPassword: [{ type: 'required', message: 'Password confirmation is required.' }],
    //     matchingPasswords: [{ type: 'areNotEqual', message: 'Password mismatch.' }],
    // }

    togglePasswordVisibility(field: string): void {
        switch (field) {
            case 'actualPassword':
                this.showActualPassword = !this.showActualPassword
                break
            case 'newPassword':
                this.showNewPassword = !this.showNewPassword
                break
            case 'confirmNewPassword':
                this.showConfirmNewPassword = !this.showConfirmNewPassword
                break
        }
    }

    changePassword(): void {
        // Implement your logic to handle password change here
        console.log('Change Password logic')
    }
}
