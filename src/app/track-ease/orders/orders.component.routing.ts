import { Route } from "@angular/router";

export const ORDERS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components/manage-orders/manage-orders.component').then((c) => c.ManageOrdersComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/create-order/create-order.component').then((c) => c.CreateUpdateOrdersComponent)
  },
  {
    path: 'update',
    loadComponent: () => import('./components/update-order/update-order.component').then((c) => c.UpdateOrderComponent)
  },
]
