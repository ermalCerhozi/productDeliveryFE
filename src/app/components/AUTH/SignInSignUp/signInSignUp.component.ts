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
        //TODO: Why use FormBuilder insted of Using FormGroup and FormControl
        this.loginForm = this.formBuilder.group({
            phoneNumber: ['', [Validators.required, Validators.pattern(phoneNumberRegex)]],
            password: ['', [Validators.required]],
            // password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
        })
    }

    login(): void {
        console.log('logIn method triggered')

        this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
                this.authService.setAuthenticatedUser(res)
                this.router.navigate(['/orders'])
            },
            error: () => {
                console.log(Error)
                // toast notification or alert
            },
        })
    }

    signIn(): void {
        console.log('signIn method triggered')
        this.containerDiv.nativeElement.classList.remove('sign-up-mode')
    }

    signUp(): void {
        console.log('signUp method triggered')
        this.containerDiv.nativeElement.classList.add('sign-up-mode')
    }
}
