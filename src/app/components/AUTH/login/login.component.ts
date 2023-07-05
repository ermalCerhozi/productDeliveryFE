import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { phoneNumberRegex } from 'src/core/common/constants'
import { AuthService } from 'src/services/auth.service'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
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

    onSubmit(): void {
        this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
                this.router.navigate([''])
                localStorage.setItem('currentUser', JSON.stringify(res)) //TODO: Not sure about this
            },
            error: () => {
                console.log(Error)
            },
        })
    }
}
