import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
    constructor(private authService: AuthService, private router: Router) {}

    logOut(): void {
        this.authService.logout().subscribe(() => {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            this.router.navigate([''])
        })
    }
}
