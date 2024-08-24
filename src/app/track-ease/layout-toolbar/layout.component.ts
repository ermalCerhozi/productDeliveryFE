import { Component, ViewChild } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Observable, map, shareReplay } from 'rxjs'
import { AuthService } from 'src/app/services/auth.service'
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav'
import { MatToolbar } from '@angular/material/toolbar';
import { MatNavList, MatListItem } from '@angular/material/list';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    standalone: true,
    imports: [
        MatDrawerContainer,
        MatDrawer,
        MatToolbar,
        MatNavList,
        NgFor,
        MatListItem,
        RouterLink,
        RouterLinkActive,
        MatIcon,
        NgIf,
        MatIconButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        RouterOutlet,
        AsyncPipe,
    ],
})
export class LayoutComponent {
    @ViewChild('drawer') drawer!: MatDrawer

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

    constructor(
        private authService: AuthService,
        private breakpointObserver: BreakpointObserver,
        private router: Router
    ) {}

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
        map((result) => result.matches),
        shareReplay()
    )

    toggleDrawerOnHandset(): void {
        this.isHandset$.subscribe((isHandset) => {
            if (isHandset) {
                this.drawer.toggle()
            }
        })
    }

    logOut(): void {
        this.authService.logOut().subscribe({
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
