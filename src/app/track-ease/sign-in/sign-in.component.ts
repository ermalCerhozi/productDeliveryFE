import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { phoneNumberRegex } from 'src/app/shared/common/constants'
import { AuthService } from 'src/app/services/auth.service'
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'app-sign-in-forgot-password',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        NgClass,
    ],
})
export class SignInComponent implements OnInit {
    @ViewChild('containerDiv') containerDiv!: ElementRef
    loginForm: FormGroup = new FormGroup({})
    forgotPasswordForm: FormGroup = new FormGroup({})
    errorMessage = false
    hide = true

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initializeForms()
    }

    initializeForms() {
        this.loginForm = this.formBuilder.group({
            phoneNumber: ['', [Validators.required, Validators.pattern(phoneNumberRegex)]],
            password: ['', [Validators.required]],
        })

        this.forgotPasswordForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        })
    }

    sendResetPasswordLink(): void {
        console.log('forgotPasswordForm:', this.forgotPasswordForm.value)
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
                this.router.navigate(['/homePage'])
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
