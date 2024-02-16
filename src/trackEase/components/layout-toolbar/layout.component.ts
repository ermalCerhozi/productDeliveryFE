import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Observable, map, shareReplay } from 'rxjs'
import { AuthService } from 'src/trackEase/services/auth.service'

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
// TODO: hide drawer when option si selected
export class LayoutComponent {
    constructor(
        private authService: AuthService,
        private breakpointObserver: BreakpointObserver,
        private router: Router
    ) {}

    routes = [
        { path: '/homePage', name: 'Home Page', icon: 'home' },
        { path: '/manageUsers', name: 'Manage users', icon: 'people' },
        { path: '/manageOrders', name: 'Manage orders', icon: 'assignment' },
        { path: '/manageProducts', name: 'Manage products', icon: 'store' },
        { path: '/profile', name: 'Profile', icon: 'account_circle' },
        // { path: '/earnings', name: 'Earnings', icon: 'show_chart' },
        // { path: '/trackDelivery', name: 'Track Delivery', icon: 'local_shipping' },
        { path: '/settings', name: 'Settings', icon: 'settings' },
    ]

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
        map((result) => result.matches),
        shareReplay()
    )

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
