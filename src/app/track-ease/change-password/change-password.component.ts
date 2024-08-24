import { Component, OnInit } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { PasswordStrengthComponent } from '../../shared/components/password-strength/password-strength.component';

interface Constants {
    readonly DIGIT_REGEX: RegExp
    readonly SYMBOL_REGEX: RegExp
}
const CONSTANTS: Constants = {
    DIGIT_REGEX: /[0-9]/,
    SYMBOL_REGEX: /[-+_!@#$%^&*,.?]/,
}

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatIconButton,
        MatSuffix,
        MatIcon,
        NgIf,
        MatError,
        PasswordStrengthComponent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class ChangePasswordComponent implements OnInit {
    showActualPassword = false
    showNewPassword = false
    showConfirmPassword = false

    public form: FormGroup = new FormGroup({})

    constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<ChangePasswordComponent>) {}

    ngOnInit(): void {
        this.form = this.createForm()
    }

    private createForm(): FormGroup {
        return this.fb.group(
            {
                actualPassword: ['', Validators.required],
                newPassword: ['', Validators.compose([this.validPassword()])],
                confirmPassword: [''],
                passwordMin: { value: false, disabled: true },
                passwordDigit: { value: false, disabled: true },
                passwordSpecial: { value: false, disabled: true },
            },
            {
                validators: Validators.compose([
                    this.validFieldMatch('newPassword', 'confirmPassword', 'Password'),
                ]),
            }
        )
    }

    validPassword(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
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

    changeUserPassword(): void {
        this.dialogRef.close(this.form.value)
    }

    // TODO: Convert into pipe
    getErrorMessage(
        errors: ValidationErrors | null | undefined
    ): ValidationErrors | null | undefined {
        if (errors) {
            return Object.values(errors).map((value) => {
                return value
            })
        }
        return null
    }

    togglePasswordVisibility(field: string): void {
        switch (field) {
            case 'actualPassword':
                this.showActualPassword = !this.showActualPassword
                break
            case 'newPassword':
                this.showNewPassword = !this.showNewPassword
                break
            case 'confirmPassword':
                this.showConfirmPassword = !this.showConfirmPassword
                break
        }
    }
}
