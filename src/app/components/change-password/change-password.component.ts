import { Component, OnInit } from '@angular/core'
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms'

interface Constants {
    readonly DIGIT_REGEX: RegExp
    initialCopyrightYear: number
    readonly SYMBOL_REGEX: RegExp
}
const CONSTANTS: Constants = {
    DIGIT_REGEX: /[0-9]/,
    initialCopyrightYear: 2021,
    SYMBOL_REGEX: /[-+_!@#$%^&*,.?]/,
}

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
    showActualPassword = false
    showNewPassword = false
    showConfirmNewPassword = false

    public form: FormGroup = new FormGroup({})

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.form = this.createForm()
    }

    private createForm(): FormGroup {
        return this.fb.group(
            {
                password: ['', Validators.compose([this.validPassword(true)])],
                confirmPassword: [''],
                passwordMin: { value: false, disabled: true },
                passwordDigit: { value: false, disabled: true },
                passwordSpecial: { value: false, disabled: true },
            },
            {
                validators: Validators.compose([
                    this.validFieldMatch('password', 'confirmPassword', 'Password'),
                ]),
            }
        )
    }

    validPassword(isRequired = false): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return isRequired ? { invalidPassword: `Password is required.` } : null
            }
            if (control.value.length < 8) {
                return { invalidPassword: `Password is too short.` }
            }
            if (!CONSTANTS.SYMBOL_REGEX.test(control.value)) {
                return {
                    invalidPassword: `Password requires at least one special character.`,
                }
            }
            if (!CONSTANTS.DIGIT_REGEX.test(control.value)) {
                return {
                    invalidPassword: `Password requires at least one numeric character.`,
                }
            }
            return null
        }
    }

    validFieldMatch(
        controlName: string,
        confirmControlName: string,
        fieldName = 'Password'
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const controlValue: unknown | null = control.get(controlName)?.value
            const confirmControlValue: unknown | null = control.get(confirmControlName)?.value

            if (!confirmControlValue) {
                control.get(confirmControlName)?.setErrors({
                    confirmFieldRequired: `Confirm ${fieldName} is required.`,
                })
            }
            if (controlValue !== confirmControlValue) {
                control
                    .get(confirmControlName)
                    ?.setErrors({ fieldsMismatched: `${fieldName} fields do not match.` })
            }
            if (controlValue && controlValue === confirmControlValue) {
                control.get(confirmControlName)?.setErrors(null)
            }
            return null
        }
    }

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
}
