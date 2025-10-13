import { Component, OnInit, inject } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { NgClass } from '@angular/common'
import { AuthService } from 'src/app/services/auth.service'
import { TranslocoDirective } from '@jsverse/transloco'

@Component({
    selector: 'app-set-password',
    templateUrl: './set-password.component.html',
    styleUrls: ['./set-password.component.scss'],
    imports: [ReactiveFormsModule, NgClass, TranslocoDirective, RouterLink],
})
export class SetPasswordComponent implements OnInit {
    private formBuilder = inject(FormBuilder)
    private authService = inject(AuthService)
    private router = inject(Router)
    private route = inject(ActivatedRoute)

    setPasswordForm: FormGroup = new FormGroup({})
    token: string = ''
    isLoading: boolean = false
    errorMessage: string = ''
    successMessage: string = ''
    hidePassword = true
    hideConfirmPassword = true

    ngOnInit(): void {
        // Extract token from query params
        this.route.queryParams.subscribe(params => {
            this.token = params['token']
            if (!this.token) {
                this.errorMessage = 'Invalid or missing token. Please check your email link.'
            }
        })

        this.initializeForm()
    }

    initializeForm(): void {
        this.setPasswordForm = this.formBuilder.group({
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8)
                ]
            ],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator })
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')
        const confirmPassword = control.get('confirmPassword')

        if (!password || !confirmPassword) {
            return null
        }

        if (confirmPassword.value === '') {
            return null
        }

        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true })
            return { passwordMismatch: true }
        } else {
            // Clear the error if passwords match
            const errors = confirmPassword.errors
            if (errors) {
                delete errors['passwordMismatch']
                confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null)
            }
            return null
        }
    }

    onSubmit(): void {
        if (this.setPasswordForm.invalid || !this.token) {
            return
        }

        this.isLoading = true
        this.errorMessage = ''
        this.successMessage = ''

        const password = this.setPasswordForm.get('password')?.value
        const confirmPassword = this.setPasswordForm.get('confirmPassword')?.value

        this.authService.setPassword(this.token, password, confirmPassword).subscribe({
            next: () => {
                this.isLoading = false
                this.successMessage = 'Password set successfully! Redirecting to login...'
                setTimeout(() => {
                    this.router.navigate(['/login'], {
                        queryParams: { passwordSet: 'true' }
                    })
                }, 2000)
            },
            error: (error: any) => {
                this.isLoading = false
                if (error.status === 400) {
                    this.errorMessage = 'Invalid or expired token. Please request a new password reset link.'
                } else if (error.status === 404) {
                    this.errorMessage = 'User not found. Please contact support.'
                } else {
                    this.errorMessage = 'An error occurred. Please try again later.'
                }
            }
        })
    }

    togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
        if (field === 'password') {
            this.hidePassword = !this.hidePassword
        } else {
            this.hideConfirmPassword = !this.hideConfirmPassword
        }
    }

    get password() {
        return this.setPasswordForm.get('password')
    }

    get confirmPassword() {
        return this.setPasswordForm.get('confirmPassword')
    }
}
