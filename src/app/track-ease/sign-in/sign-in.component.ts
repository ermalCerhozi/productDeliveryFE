import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import { Router } from '@angular/router'
import { NgIf, NgClass } from '@angular/common'

import { AuthService } from 'src/app/services/auth.service'
import { TranslocoDirective } from '@jsverse/transloco'

@Component({
    selector: 'app-sign-in-forgot-password',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css'],
    imports: [FormsModule, ReactiveFormsModule, NgIf, NgClass, TranslocoDirective]
})
export class SignInComponent implements OnInit {
    private formBuilder = inject(FormBuilder)
    private authService = inject(AuthService)
    private router = inject(Router)

    @ViewChild('containerDiv') containerDiv!: ElementRef
    loginForm: FormGroup = new FormGroup({})
    forgotPasswordForm: FormGroup = new FormGroup({})
    errorMessage = false
    hide = true

    ngOnInit(): void {
        this.initializeForms()
    }

    initializeForms() {
        this.loginForm = this.formBuilder.group({
            phoneNumber: ['', [Validators.required]],
            password: ['', [Validators.required]],
        })

        this.forgotPasswordForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        })
    }

    sendResetPasswordLink(): void {
        this.authService.resetPassword(this.forgotPasswordForm.value).subscribe({
            next: () => {
                this.forgotPasswordForm.reset()
                this.loginForm.reset()
                this.goTo('signIn')
            },
            error: (error) => {
                this.errorMessage = true
                console.log('error:', error)
            },
        })
    }

    login(): void {
        this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
                this.errorMessage = false
                this.authService.setAuthenticatedUser(res)
                this.router.navigate(['/users'])
            },
            error: () => {
                this.errorMessage = true
                console.log('error:', Error)
            },
        })
    }

    goTo(navigateTo: string): void {
        switch (navigateTo) {
            case 'signIn':
                this.containerDiv.nativeElement.classList.remove('forgot-password-mode')
                break
            case 'forgotPassword':
                this.containerDiv.nativeElement.classList.add('forgot-password-mode')
                break
        }
    }
}
