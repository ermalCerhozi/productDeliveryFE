import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { phoneNumberRegex } from 'src/shared/common/constants'
import { AuthService } from 'src/services/auth.service'

@Component({
    selector: 'app-sign-in-sign-up',
    templateUrl: './signInSignUp.component.html',
    styleUrls: ['./signInSignUp.component.css'],
})
export class signInSignUpComponent implements OnInit {
    @ViewChild('containerDiv') containerDiv!: ElementRef
    loginForm: FormGroup = new FormGroup({})
    errorMessage = false
    hide = true

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initializeForm()
    }

    initializeForm() {
        this.loginForm = this.formBuilder.group({
            phoneNumber: ['', [Validators.required, Validators.pattern(phoneNumberRegex)]],
            password: ['', [Validators.required]],
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

    signIn(): void {
        console.log('signIn method triggered')
        this.containerDiv.nativeElement.classList.remove('sign-up-mode')
    }

    forgotPassword(): void {
        console.log('signUp method triggered')
        this.containerDiv.nativeElement.classList.add('sign-up-mode')
    }
}
