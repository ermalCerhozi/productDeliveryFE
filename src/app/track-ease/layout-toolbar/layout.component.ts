import { Component, ViewChild, inject } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { AsyncPipe } from '@angular/common'

import { Observable, map, shareReplay, take } from 'rxjs'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { MatIconButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { MatNavList, MatListItem } from '@angular/material/list'
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu'
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav'
import { MatToolbar } from '@angular/material/toolbar'

import { AuthService } from 'src/app/services/auth.service'
import { TranslocoDirective } from '@jsverse/transloco'

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
    imports: [
        MatDrawerContainer,
        MatDrawer,
        MatToolbar,
        MatNavList,
        MatListItem,
        RouterLink,
        RouterLinkActive,
        MatIcon,
        MatIconButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        RouterOutlet,
        AsyncPipe,
        TranslocoDirective,
    ],
})
export class LayoutComponent {
    private authService = inject(AuthService)
    private breakpointObserver = inject(BreakpointObserver)
    private router = inject(Router)

    @ViewChild('drawer') drawer!: MatDrawer

    private routes: NavRouteConfig[] = [
        { path: 'homePage', name: 'Home Page', icon: 'home', roles: ['Admin', 'Client'] },
        { path: 'users', name: 'layout.users', icon: 'people', roles: ['Admin'] },
        { path: 'orders', name: 'layout.orders', icon: 'assignment', roles: ['Admin'] },
        { path: 'products', name: 'layout.products', icon: 'store', roles: ['Admin'] },
        { path: 'permissions', name: 'layout.permissions', icon: 'lock', roles: ['Admin'] },
        {
            path: 'profile',
            name: 'layout.profile',
            icon: 'account_circle',
            roles: ['Admin', 'Client'],
        },
        // { path: 'earnings', name: 'Earnings', icon: 'show_chart' },
        // { path: 'trackDelivery', name: 'Track Delivery', icon: 'local_shipping' },
        { path: 'settings', name: 'layout.settings', icon: 'settings', roles: ['Admin'] },
    ]

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
