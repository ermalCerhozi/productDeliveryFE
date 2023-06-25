import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            phoneNumber: ['', Validators.required],
            password: ['', Validators.required],
        })
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return
        }

        this.authService
            .login(
                this.loginForm.controls['phoneNumber'].value,
                this.loginForm.controls['password'].value
            )
            .subscribe({
                next: () => {
                    console.log('Login successful')
                    this.router.navigate(['/home'])
                },
                error: () => {
                    console.log(Error)
                },
            })
    }
}
