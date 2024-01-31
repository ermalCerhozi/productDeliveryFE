import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from 'src/services/auth.service'

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
    constructor(private authService: AuthService, private router: Router) {}
    routes = [
        { path: '', name: 'Back to Main Screen', icon: 'arrow_back' },
        { path: '/orders', name: 'Orders' },
        { path: '/manageUsers', name: 'Manage users' },
        { path: '/manageOrders', name: 'Manage orders' },
        { path: '/manageProducts', name: 'Manage products' },
    ]

    logOut(): void {
        this.authService.logout().subscribe({
            next: () => {
                this.authService.clearAuthenticatedUser()
                this.router.navigate([''])
            },
            error: (err) => {
                console.error('Logout failed:', err)
                // toast notification or alert
            },
        })
    }
}
