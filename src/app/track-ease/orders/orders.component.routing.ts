import { Route } from '@angular/router'

export const ORDERS_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./components/orders-list/orders-list.component').then(
                (c) => c.OrdersListComponent
            ),
    },
    {
        path: 'create',
        loadComponent: () =>
            import('./components/create-order/create-order.component').then(
                (c) => c.CreateUpdateOrdersComponent
            ),
    },
    // {
    //     path: 'update',
    //     loadComponent: () =>
    //         import('./components/update-order/update-order.component').then(
    //             (c) => c.UpdateOrderComponent
    //         ),
    // },
]
