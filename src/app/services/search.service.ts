import { Injectable, OnDestroy } from '@angular/core'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import {
    BehaviorSubject,
    bufferTime,
    combineLatest,
    combineLatestWith,
    distinctUntilChanged,
    map,
    Observable,
    Subject,
    take,
    takeUntil,
} from 'rxjs'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { ClientFiltersResponse } from 'src/app/shared/models/mediaLibraryResponse.model'
import { AdvancedSelection } from 'src/app/shared/models/advanced-selection.model'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
// import { AnalyticsService } from '@app/core/analytics/analytics.service'
// import { AnalyticsEventPayload } from '@app/core/analytics/models/AnalyticsEventPayload'
// import { AnalyticsEvent } from '@app/core/analytics/models/AnalyticsEvent'
// import { AnalyticsEventName } from '@app/core/analytics/models/AnalyticsEventName'
// import { AnalyticsEventLocation } from '@app/core/analytics/models/AnalyticsEventLocation'

@Injectable({
    providedIn: 'root',
})
export class SearchService implements OnDestroy {
    private onDestroy = new Subject<void>()
    private clientSelectSubject = new Subject<AdvancedSelection>()
    private sellerSelectSubject = new Subject<AdvancedSelection>()

    private debounceTimeout: ReturnType<typeof setTimeout> | undefined

    // private mediaTypes: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>([  //TODO: to be renamed into brad, pastery, peta etc...
    //     { value: 'image', label: 'GT_MEDIA_TYPE_IMAGE', isTranslated: true, count: 0 },
    //     { value: 'audio', label: 'GT_MEDIA_TYPE_AUDIO', isTranslated: true, count: 0 },
    //     { value: 'video', label: 'GT_MEDIA_TYPE_VIDEO', isTranslated: true, count: 0 },
    //     { value: 'widget', label: 'GT_MEDIA_TYPE_WIDGET', isTranslated: true, count: 0 },
    // ])
    // private selectedTypes: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>([])

    // private missingData: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>([ //TODO: Can be used to filter completed orders or not completed orders in the future
    //     {
    //         value: 'missingAltText',
    //         label: 'GT_MEDIA_MISSING_ALT_TEXT',
    //         isTranslated: true,
    //         count: 0,
    //     },
    //     {
    //         value: 'missingLongDescription',
    //         label: 'GT_MEDIA_MISSING_LONG_DESCRIPTION',
    //         isTranslated: true,
    //         count: 0,
    //     },
    // ])
    // private selectedMissingData: BehaviorSubject<FilterOption[]> = new BehaviorSubject<
    //     FilterOption[]
    // >([])

    public readonly defaultDateFilter: FilterOption = {
        value: 'any-time',
        label: 'TE_ORDER_DATE_ANY_TIME',
        isTranslated: true,
    }
    private orderDates: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>([
        { value: 'any-time', label: 'TE_ORDER_DATE_ANY_TIME', isTranslated: true },
        { value: 'last-24h', label: 'TE_ORDER_DATE_LAST_24_HOURS', isTranslated: true },
        { value: 'last-48h', label: 'TE_ORDER_DATE_LAST_48_HOURS', isTranslated: true },
        { value: 'last-72h', label: 'TE_ORDER_DATE_LAST_72_HOURS', isTranslated: true },
        { value: 'last-7days', label: 'TE_ORDER_DATE_LAST_7_DAYS', isTranslated: true },
        { value: 'last-30days', label: 'TE_ORDER_DATE_LAST_30_DAYS', isTranslated: true },
        { value: 'last-12months', label: 'TE_ORDER_DATE_LAST_12_MONTHS', isTranslated: true },
    ])
    private selectedDate: BehaviorSubject<FilterOption> = new BehaviorSubject<FilterOption>(
        this.defaultDateFilter
    )

    private orderClient: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>([])
    private selectedClient: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>(
        []
    )
    private clientsLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private hasMoreClientsToLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
    public clientSearchQuery = ''

    private orderSeller: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>([])
    private selectedSeller: BehaviorSubject<FilterOption[]> = new BehaviorSubject<FilterOption[]>(
        []
    )
    private sellersLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private hasMoreSellersToLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
    public sellerSearchQuery = ''

    constructor(private bakeryManagementService: BakeryManagementService) {
        this.subscribeToClientSelectSubject()
        this.subscribeToSellerSelectSubject()
        this.subscribeToSynchronizeFilters()
        this.subscribeToSynchronizeCount()
    }

    ngOnDestroy() {
        this.onDestroy.next()
        this.onDestroy.complete()
    }

    // FILTERS GETTERS
    // getMediaTypes() {
    //     return this.mediaTypes.asObservable()
    // }
    // getMissingData() {
    //     return this.missingData.asObservable()
    // }
    getMediaDates() {
        return this.orderDates.asObservable()
    }
    getOrderClients() {
        return this.orderClient.asObservable()
    }
    getOrderSellers() {
        return this.orderSeller.asObservable()
    }

    // SELECTED FILTERS GETTERS
    // getSelectedTypes() {
    //     return this.selectedTypes.asObservable()
    // }
    // getSelectedMissingData() {
    //     return this.selectedMissingData.asObservable()
    // }
    getSelectedDate() {
        return this.selectedDate.asObservable()
    }
    getSelectedClients() {
        return this.selectedClient.asObservable()
    }
    getClientsLoading() {
        return this.clientsLoading.asObservable()
    }
    getHasMoreClientsToLoad() {
        return this.hasMoreClientsToLoad.asObservable()
    }
    getSelectedSellers() {
        return this.selectedSeller.asObservable()
    }
    getSellersLoading() {
        return this.sellersLoading.asObservable()
    }
    getHasMoreSellersToLoad() {
        return this.hasMoreSellersToLoad.asObservable()
    }

    // DATA STORED IN THE NAVIGATION CONTEXT
    getTotalMediaCount(): number {
        return this.bakeryManagementService.countData.countActive
    }
    getSearchOptions(): SearchOptions {
        return this.bakeryManagementService.navigationContext.searchOptions
    }
    getSearchQuery(): string {
        return this.bakeryManagementService.navigationContext.filters.queryString || ''
    }

    // FUCTIONS
    loadMoreClients() {
        this.getPaginatedClients()
    }

    loadMoreSellers() {
        this.getPaginatedSellers()
    }

    clientSearchChange(data: string) {
        this.clientSearchQuery = data
        this.orderClient.next([])
        this.hasMoreClientsToLoad.next(true)
        this.getPaginatedClients()
    }

    sellerSearchChange(data: string) {
        this.sellerSearchQuery = data
        this.orderSeller.next([])
        this.hasMoreSellersToLoad.next(true)
        this.getPaginatedSellers()
    }

    setSearchOptions(searchOptions: SearchOptions) {
        this.bakeryManagementService.navigationContext.searchOptions = searchOptions
        this.onApplyFilters()
        // this.trackSearchEvent()
    }

    setSearchQuery(searchQuery: string) {
        if (searchQuery !== this.bakeryManagementService.navigationContext.filters.queryString) {
            this.bakeryManagementService.navigationContext.filters.queryString = searchQuery
            this.onApplyFilters()
            // this.trackSearchEvent()
        }
    }

    // applyTypeFilters(data: FilterOption[]) {
    //     this.selectedTypes.next(data)
    //     this.applyFiltersDebounced()
    // }

    // applyMissingDataFilters(data: FilterOption[]) {
    //     this.selectedMissingData.next(data)
    //     this.applyFiltersDebounced()
    // }

    applyDateFilter(data: FilterOption) {
        this.selectedDate.next(data)
        this.applyFiltersDebounced()
    }

    /* istanbul ignore next */
    applyClientFilters(data: AdvancedSelection) {
        this.clientSelectSubject.next(data)
    }

    applySellerFilters(data: AdvancedSelection) {
        this.sellerSelectSubject.next(data)
    }

    //????????????????????????????????????????????????????????
    applyClientsFiltersImmediately(data: AdvancedSelection[]) {
        this.applyAdvancedFilters(data, this.selectedClient)
    }

    //????????????????????????????????????????????????????????
    applySellersFiltersImmediately(data: AdvancedSelection[]) {
        this.applyAdvancedFilters(data, this.selectedSeller)
    }

    clearFilters() {
        // this.selectedTypes.next([])
        // this.selectedMissingData.next([])
        this.selectedClient.next([])
        this.selectedSeller.next([])
        this.selectedDate.next(this.defaultDateFilter)
        this.bakeryManagementService.clearFilters()
        this.applyFilters()
    }

    removeFilter(data: FilterOption) {
        if (data.value === this.selectedDate.value.value) {
            this.selectedDate.next(this.defaultDateFilter)
        } else {
            // this.selectedTypes.next(this.selectedTypes.value.filter((f) => f.value !== data.value))
            // this.selectedMissingData.next(
            //     this.selectedMissingData.value.filter((f) => f.value !== data.value)
            // )
            this.selectedClient.next(
                this.selectedClient.value.filter((f) => f.value !== data.value)
            )
            this.selectedSeller.next(
                this.selectedSeller.value.filter((f) => f.value !== data.value)
            )
        }
        this.applyFilters()
    }

    getFilterResults(): Observable<FilterOption[]> {
        return this.getBaseFilterResults().pipe(
            combineLatestWith(this.selectedSeller, this.selectedClient),
            map(([previous, clients, sellers]) => [...previous, ...clients, ...sellers]),
            distinctUntilChanged(
                (previous, current) =>
                    previous.length === current.length &&
                    previous.every((value, index) => value === current[index])
            )
        )
    }

    subscribeToSynchronizeCount() {
        this.bakeryManagementService.synchronizeCountSubject
            .pipe(takeUntil(this.onDestroy))
            .subscribe(() => {
                this.updateFilterCounts()
            })
    }

    subscribeToSynchronizeFilters() {
        this.bakeryManagementService.synchronizeFiltersSubject
            .pipe(takeUntil(this.onDestroy))
            .subscribe(() => {
                this.updateFiltersBasedOnSearchQuery()
            })
    }

    // TODO: check in waht tab we are currently
    hasFiltered(activeTab: string): Observable<boolean> {
        // return iif(
        //     () => activeTab === ActiveTab.MediaLibrary.valueOf(),
        //     this.getMediaLibraryFilterResults(),
        //     this.getTrashBinFilterResults()
        // ).pipe(map((results) => results.length > 0))
        return this.getFilterResults().pipe(map((results) => results.length > 0))
    }

    hasSearched(): boolean {
        return (
            this.bakeryManagementService.navigationContext.filters.queryString !== undefined &&
            this.bakeryManagementService.navigationContext.filters.queryString.length > 0
        )
    }

    private updateFiltersBasedOnSearchQuery() {
        // if (this.bakeryManagementService.navigationContext.filters.type) {
        //     this.selectedTypes.next(
        //         this.mediaTypes.value.filter(
        //             (f) =>
        //                 this.bakeryManagementService.navigationContext.filters.type &&
        //                 this.bakeryManagementService.navigationContext.filters.type.includes(f.value)
        //         )
        //     )
        // }

        // this.selectedMissingData.next(
        //     this.missingData.value.filter((f) => {
        //         return (
        //             (f.value === 'missingAltText' &&
        //                 this.bakeryManagementService.navigationContext.filters.missingAltText) ||
        //             (f.value === 'missingLongDescription' &&
        //                 this.bakeryManagementService.navigationContext.filters.missingLongDescription)
        //         )
        //     })
        // )

        if (this.bakeryManagementService.navigationContext.filters.clients) {
            this.selectedClient.next(this.bakeryManagementService.navigationContext.filters.clients)
        }

        if (this.bakeryManagementService.navigationContext.filters.sellers) {
            this.selectedSeller.next(this.bakeryManagementService.navigationContext.filters.sellers)
        }

        this.selectedDate.next(
            this.orderDates.value.find(
                (f) => f.value === this.bakeryManagementService.navigationContext.filters.date
            ) || this.defaultDateFilter
        )
    }

    private updateFilterCounts() {
        // this.mediaTypes.next(
        //     this.mediaTypes.value.map((type) => {
        //         type.count =
        //             this.bakeryManagementService.countData.countTypes.find(
        //                 (countType) => countType.group === type.value
        //             )?.reduction || 0
        //         return type
        //     })
        // )
        // this.missingData.next(
        //     this.missingData.value.map((filter) => {
        //         if (filter.value === 'missingAltText') {
        //             filter.count =
        //                 this.bakeryManagementService.countData.countMissingData.missingAltText
        //         }
        //         if (filter.value === 'missingLongDescription') {
        //             filter.count =
        //                 this.bakeryManagementService.countData.countMissingData.missingLongDescription
        //         }
        //         return filter
        //     })
        // )
    }

    private getBaseFilterResults(): Observable<FilterOption[]> {
        const observables = [
            // this.selectedTypes,
            // this.selectedMissingData,
            this.getSelectedDateFilterResults(),
        ]

        return combineLatest(observables).pipe(
            map((results) => {
                return results.flat()
            })
        )
    }

    private getSelectedDateFilterResults(): Observable<FilterOption[]> {
        return this.selectedDate.asObservable().pipe(
            map((date) => {
                if (date.value === 'any-time') {
                    return []
                } else {
                    return [date]
                }
            })
        )
    }

    /* istanbul ignore next */
    private subscribeToClientSelectSubject() {
        this.clientSelectSubject
            .pipe(bufferTime(800), takeUntil(this.onDestroy))
            .subscribe((data: AdvancedSelection[]) => {
                if (data.length > 0) {
                    this.applyClientsFiltersImmediately(data)
                }
            })
    }

    private subscribeToSellerSelectSubject() {
        this.sellerSelectSubject
            .pipe(bufferTime(800), takeUntil(this.onDestroy))
            .subscribe((data: AdvancedSelection[]) => {
                if (data.length > 0) {
                    this.applySellersFiltersImmediately(data)
                }
            })
    }

    /**
     * Applies newly selected advanced filters to the currently selected filters.
     *
     * @param {AdvancedSelection[]} selectedFilters - The filters to be applied.
     * @param {BehaviorSubject<FilterOption[]>} currentlySelectedFilters - The current set of selected filters.
     *
     * This function first makes a copy of the currently selected filters.
     * If the selected filter is not already in the current filters and is selected, it is added to the list. If the selected filter is not selected, it is removed from the current list.
     * The function checks if the modified filters are different from the current selected filters. If they are different, the function applies the filters.
     */
    private applyAdvancedFilters(
        selectedFilters: AdvancedSelection[],
        currentlySelectedFilters: BehaviorSubject<FilterOption[]>
    ) {
        //makes a copy of the current selected filters
        let temporarySelectedFilters = [...currentlySelectedFilters.value]
        //adds/removes the selected filters from the copy
        selectedFilters.forEach((selectedFilter: AdvancedSelection) => {
            if (
                selectedFilter.selected &&
                !temporarySelectedFilters.some((f) => f.value === selectedFilter.value.value)
            ) {
                temporarySelectedFilters.push(selectedFilter.value)
            } else if (!selectedFilter.selected) {
                temporarySelectedFilters = temporarySelectedFilters.filter(
                    (tf) => tf.value !== selectedFilter.value.value
                )
            }
        })
        //checks if the copy is different from the current selected filters
        const isChanged = this.haveFiltersChanged(
            temporarySelectedFilters,
            currentlySelectedFilters.value
        )
        // applies the filters if they are different
        if (isChanged) {
            currentlySelectedFilters.next(temporarySelectedFilters)
            this.applyFilters()
        }
    }

    // checks if the temporary selected filters are different from the current selected filters
    private haveFiltersChanged(
        temporaryFilterArray: FilterOption[],
        selectedFilterArray: FilterOption[]
    ): boolean {
        if (!temporaryFilterArray.length && !selectedFilterArray.length) {
            return false
        }
        if (temporaryFilterArray.length === selectedFilterArray.length) {
            return temporaryFilterArray.every(
                (tempFilter, index) => tempFilter.value !== selectedFilterArray[index].value
            )
        }
        return true
    }

    private applyFiltersDebounced() {
        clearTimeout(this.debounceTimeout)
        this.debounceTimeout = setTimeout(() => {
            this.applyFilters()
        }, 800)
    }

    private applyFilters() {
        // this.bakeryManagementService.navigationContext.filters.type = this.selectedTypes.value.map(
        //     (f) => f.value
        // )
        // const filterOptionValues = this.selectedMissingData.value.map((d) => d.value)
        // if (filterOptionValues.includes('missingAltText')) {
        //     this.bakeryManagementService.navigationContext.filters.missingAltText = true
        // } else {
        //     this.bakeryManagementService.navigationContext.filters.missingAltText = undefined
        // }
        // if (filterOptionValues.includes('missingLongDescription')) {
        //     this.bakeryManagementService.navigationContext.filters.missingLongDescription = true
        // } else {
        //     this.bakeryManagementService.navigationContext.filters.missingLongDescription = undefined
        // }
        this.bakeryManagementService.navigationContext.filters.date = this.selectedDate.value.value
        this.bakeryManagementService.navigationContext.filters.clientIds =
            this.selectedClient.value.map((f) => f.value)
        this.bakeryManagementService.navigationContext.filters.clients = this.selectedClient.value
        this.bakeryManagementService.navigationContext.filters.sellerIds =
            this.selectedSeller.value.map((f) => f.value)
        this.bakeryManagementService.navigationContext.filters.sellers = this.selectedSeller.value

        this.onApplyFilters()
        // this.trackFilterEvent()
    }

    private onApplyFilters() {
        this.bakeryManagementService.resetPagination()
        this.bakeryManagementService.navigationContext.getCount = false
        // this.bakeryManagementService.updateMediaList(false)
        this.bakeryManagementService.updateOrdersList(false).subscribe() //TODO: to be be implemented alogside updateUserList using the active tab
        this.bakeryManagementService.clearActiveMedia() //TODO: Same as above
    }

    private getPaginatedClients() {
        this.clientsLoading.next(true)
        this.bakeryManagementService
            .getClientFiltersForOrder(this.orderClient.value.length, this.clientSearchQuery)
            .pipe(
                take(1),
                map((clientList: ClientFiltersResponse[]) => {
                    this.hasMoreClientsToLoad.next(clientList.length !== 0)
                    this.addClientsToSelectionList(clientList)
                    this.selectedClient.next([...this.selectedClient.value])
                    this.clientsLoading.next(false)
                })
            )
            .subscribe()
    }

    private getPaginatedSellers() {
        this.sellersLoading.next(true)
        this.bakeryManagementService
            .getSellerFiltersForOrder(this.orderSeller.value.length, this.sellerSearchQuery)
            .pipe(
                take(1),
                map((sellerList: ClientFiltersResponse[]) => {
                    this.hasMoreSellersToLoad.next(sellerList.length !== 0)
                    this.addSellersToSelectionList(sellerList)
                    this.selectedSeller.next([...this.selectedSeller.value])
                    this.sellersLoading.next(false)
                })
            )
            .subscribe()
    }

    private addClientsToSelectionList(clientList: ClientFiltersResponse[]) {
        const newOrderClients: FilterOption[] = []
        clientList.forEach((client) =>
            newOrderClients.push({
                value: client.id,
                label: client.first_name + ' ' + client.last_name,
                count: client.mediaCount,
            })
        )
        this.orderClient.next([...this.orderClient.value, ...newOrderClients])
    }

    private addSellersToSelectionList(sellerList: ClientFiltersResponse[]) {
        const newOrderSellers: FilterOption[] = []
        sellerList.forEach((seller) =>
            newOrderSellers.push({
                value: seller.id,
                label: seller.first_name + ' ' + seller.last_name,
                count: seller.mediaCount,
            })
        )
        this.orderSeller.next([...this.orderSeller.value, ...newOrderSellers])
    }

    // private trackSearchEvent() {
    //     const event: AnalyticsEventPayload = {
    //         event: AnalyticsEvent.CUSTOM_GT_SPECIFIC,
    //         eventName: AnalyticsEventName.MEDIA_SEARCHED,
    //         location: AnalyticsEventLocation.MEDIA_LIBRARY,
    //         search: {
    //             keyword: this.bakeryManagementService.navigationContext.filters.queryString,
    //             options: {
    //                 title: this.bakeryManagementService.navigationContext.searchOptions.title,
    //                 metadata: this.bakeryManagementService.navigationContext.searchOptions.metadata,
    //             },
    //         },
    //     }
    //     // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //     this.analyticsService.track(event)
    // }

    // private trackFilterEvent() {
    //     const event: AnalyticsEventPayload = {
    //         event: AnalyticsEvent.CUSTOM_GT_SPECIFIC,
    //         eventName: AnalyticsEventName.MEDIA_FILTERED,
    //         location: AnalyticsEventLocation.MEDIA_LIBRARY,
    //         filter: {
    //             format: this.bakeryManagementService.navigationContext.filters.format,
    //             type: this.bakeryManagementService.navigationContext.filters.type,
    //             date: this.bakeryManagementService.navigationContext.filters.date,
    //         },
    //     }
    //     // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //     this.analyticsService.track(event)
    // }
}
