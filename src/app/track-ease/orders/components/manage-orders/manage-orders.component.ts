import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { OrderEntity } from 'src/app/shared/models/order.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { DropdownEvent, DropdownMenuListItem } from 'src/app/shared/models/DropdownMenuListItem'
import { DropdownActionOptions } from 'src/app/shared/models/actionOptions'
import { Observable, Subject, switchMap, takeUntil } from 'rxjs'
import { UserEntity } from 'src/app/shared/models/user.model'
import {
    MatTableDataSource,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
} from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { SearchService } from 'src/app/services/search.service'
import { AdvancedSelection } from 'src/app/shared/models/advanced-selection.model'
import { MatButton, MatIconButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { FiltersComponent } from '../../../../shared/components/filters/filters.component'
import { SimpleRadioSelectFilterComponent } from '../../../../shared/components/filters/simple-radio-select-filter/simple-radio-select-filter.component'
import { AdvancedTextFilterComponent } from '../../../../shared/components/filters/advanced-text-filter/advanced-text-filter.component'
import { MatDivider } from '@angular/material/divider'
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common'
import { FiltersResultComponent } from '../../../../shared/components/filters-panel/filters-result/filters-result.component'
import { MatMenuTrigger } from '@angular/material/menu'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { DropdownMenuListComponent } from '../../../../shared/components/dropdown-menu-list/dropdown-menu-list.component'
import { ActivatedRoute, Router } from '@angular/router'
import { DownloadPdfComponent } from '../download-pdf/download-pdf.component'

@Component({
    selector: 'app-manage-orders',
    templateUrl: './manage-orders.component.html',
    styleUrls: ['./manage-orders.component.scss'],
    standalone: true,
    imports: [
        MatButton,
        MatIcon,
        FiltersComponent,
        SimpleRadioSelectFilterComponent,
        AdvancedTextFilterComponent,
        MatDivider,
        NgIf,
        FiltersResultComponent,
        MatTable,
        MatColumnDef,
        MatHeaderCellDef,
        MatHeaderCell,
        MatCellDef,
        MatCell,
        NgFor,
        MatIconButton,
        MatMenuTrigger,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MatNoDataRow,
        MatProgressSpinner,
        MatPaginator,
        DropdownMenuListComponent,
        AsyncPipe,
        DatePipe,
        ConfirmationDialogComponent,
    ],
})
export class ManageOrdersComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild('confirmationDialogContainer')
    confirmationDialogContainer!: TemplateRef<ConfirmationDialogComponent>

    private destroy$ = new Subject<void>()

    filterResults: Observable<FilterOption[]>

    mediaDates: Observable<FilterOption[]>
    defaultDate: FilterOption
    selectedDate: Observable<FilterOption>

    clients: Observable<FilterOption[]>
    selectedClients: Observable<FilterOption[]>
    clientsLoading: Observable<boolean>
    hasMoreClientsToLoad: Observable<boolean>

    sellers: Observable<FilterOption[]>
    selectedSellers: Observable<FilterOption[]>
    sellersLoading: Observable<boolean>
    hasMoreSellersToLoad: Observable<boolean>

    // selectedTypes: Observable<FilterOption[]>
    // mediaTypes: Observable<FilterOption[]>
    // loadingTypeFilter = { value: true }

    displayedColumns: string[] = ['client', 'order', 'date', 'actions']
    activeOrder: OrderEntity | undefined

    dataSource: MatTableDataSource<OrderEntity> = new MatTableDataSource<OrderEntity>([])
    isLoading = false
    loggedInUser!: UserEntity

    actionDropdown: DropdownMenuListItem[] = [
        {
            label: DropdownActionOptions.EDIT,
            icon: 'edit',
        },
        {
            label: DropdownActionOptions.DELETE,
            icon: 'delete',
        },
    ]

    action = 'create'

    constructor(
        public bakeryManagementService: BakeryManagementService,
        public searchService: SearchService,
        private bakeryManagementApiService: BakeryManagementApiService,
        public dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.filterResults = this.searchService.getFilterResults()

        this.mediaDates = this.searchService.getMediaDates()
        this.defaultDate = this.searchService.defaultDateFilter
        this.selectedDate = this.searchService.getSelectedDate()

        this.clients = this.searchService.getClients()
        this.selectedClients = this.searchService.getSelectedClients()
        this.clientsLoading = this.searchService.getClientsLoading()
        this.hasMoreClientsToLoad = this.searchService.getHasMoreClientsToLoad()

        this.sellers = this.searchService.getSellers()
        this.selectedSellers = this.searchService.getSelectedSellers()
        this.sellersLoading = this.searchService.getSellersLoading()
        this.hasMoreSellersToLoad = this.searchService.getHasMoreSellersToLoad()

        // this.mediaTypes = this.searchService.getMediaTypes()
        // this.selectedTypes = this.searchService.getSelectedTypes()
    }

    ngOnInit() {
        this.bakeryManagementService.getBaseNavigationContext()
        this.loggedInUser = this.bakeryManagementService.getLoggedInUser() //TODO: make a interceptor for this.
        this.getOrdersList(false)
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator
        this.paginator.page.subscribe((event) => {
            if (event.pageIndex > event.previousPageIndex!) {
                this.getOrdersList(true)
            }
        })
    }

    getOrdersList(append: boolean) {
        this.isLoading = true
        this.bakeryManagementService
            .updateOrdersList(append)
            .pipe(
                switchMap(() => this.bakeryManagementService.ordersList$),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (orders) => {
                    this.isLoading = false
                    this.dataSource.data = orders
                },
                error: (error) => {
                    this.isLoading = false
                    console.log('Error: ', error)
                },
            })
    }

    selectOrder(order: OrderEntity): void {
        this.activeOrder = order
    }

    onDropdownMenuClick(item: DropdownEvent): void {
        const { option } = item
        switch (option.label) {
            case DropdownActionOptions.EDIT:
                this.updateOrder()
                break
            case DropdownActionOptions.DELETE:
                this.deleteOrder()
                break
            default:
                break
        }
    }

    updateOrder(): void {
        this.action = 'update'
        this.router.navigate(['update'], {
            relativeTo: this.route,
            queryParams: { id: this.activeOrder!.id },
        })
    }

    createOrder(): void {
        this.action = 'create'
        this.router.navigate(['create'], { relativeTo: this.route })
    }

    clientSearchChange(data: string) {
        this.searchService.clientSearchChange(data)
    }
    loadMoreClients() {
        this.searchService.loadMoreClients()
    }

    sellerSearchChange(data: string) {
        this.searchService.sellerSearchChange(data)
    }
    loadMoreSellers() {
        this.searchService.loadMoreSellers()
    }

    applyFilters(data: FilterOption | FilterOption[] | AdvancedSelection, filterType: string) {
        switch (filterType) {
            // case 'type':
            //     this.searchService.applyTypeFilters(data as FilterOption[])
            //     break
            // case 'missingData':
            //     this.searchService.applyMissingDataFilters(data as FilterOption[])
            //     break
            case 'date':
                this.searchService.applyDateFilter(data as FilterOption)
                break
            case 'client':
                this.searchService.applyClientFilters(data as AdvancedSelection)
                break
            case 'seller':
                this.searchService.applySellerFilters(data as AdvancedSelection)
                break
        }
    }

    removeFilter(data: FilterOption) {
        this.searchService.removeFilter(data)
    }

    clearFilters() {
        this.searchService.clearFilters()
    }

    deleteOrder(): void {
        this.dialog.open(this.confirmationDialogContainer, {
            width: '70%',
            maxHeight: '40%',
        })
    }

    onDeleteOrder(): void {
        this.dialog.closeAll()
        this.bakeryManagementApiService.deleteOrder(this.activeOrder!.id).subscribe({
            next: () => {
                this.getOrdersList(false)
                this.activeOrder = undefined
            },
            error: (error) => {
                console.log('Error: ', error)
            },
        })
    }

    downloadOrdersPdf() {
        this.dialog.open(DownloadPdfComponent)
    }
}
