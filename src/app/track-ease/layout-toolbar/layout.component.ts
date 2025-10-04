import { Component, ViewChild } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Observable, map, shareReplay, take } from 'rxjs'
import { AuthService } from 'src/app/services/auth.service'
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav'
import { MatToolbar } from '@angular/material/toolbar'
import { MatNavList, MatListItem } from '@angular/material/list'
import { NgFor, NgIf, AsyncPipe } from '@angular/common'
import { MatIcon } from '@angular/material/icon'
import { MatIconButton } from '@angular/material/button'
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu'

interface NavRouteConfig {
    path: string
    name: string
    icon: string
    roles?: string[]
}

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

    private readonly routes: NavRouteConfig[] = [
        // { path: '/homePage', name: 'Home Page', icon: 'home', roles: ['Admin', 'Client'] },
        { path: '/users', name: 'Users', icon: 'people', roles: ['Admin'] },
        { path: '/orders', name: 'Orders', icon: 'assignment', roles: ['Admin'] },
        { path: '/products', name: 'Products', icon: 'store', roles: ['Admin'] },
        { path: '/permissions', name: 'Permissions', icon: 'lock', roles: ['Admin'] },
        { path: '/profile', name: 'Profile', icon: 'account_circle', roles: ['Admin', 'Client'] },
        // { path: '/earnings', name: 'Earnings', icon: 'show_chart' },
        // { path: '/trackDelivery', name: 'Track Delivery', icon: 'local_shipping' },
        { path: '/settings', name: 'Settings', icon: 'settings', roles: ['Admin'] },
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

    get visibleRoutes(): NavRouteConfig[] {
        const user = this.authService.getAuthenticatedUser
        if (!user) {
            return []
        }
        return this.routes.filter((route) => {
            return !route.roles || route.roles.includes(user.role)
        })
    }

    toggleDrawerOnHandset(): void {
        this.isHandset$.pipe(take(1)).subscribe((isHandset) => {
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
