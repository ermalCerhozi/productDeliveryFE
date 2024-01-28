import { Injectable, OnDestroy } from '@angular/core'
import {
    BehaviorSubject,
    bufferTime,
    combineLatestWith,
    distinctUntilChanged,
    iif,
    map,
    Observable,
    Subject,
    take,
    takeUntil,
    tap,
} from 'rxjs'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { SearchOptions, Filters } from 'src/shared/models/navigation-context.model'

@Injectable({
    providedIn: 'root',
})
export class MediaLibrarySearchService implements OnDestroy {
    private onDestroy = new Subject<void>()
    private debounceTimeout: ReturnType<typeof setTimeout> | undefined

    public readonly defaultDateFilter: {value: string, label: string} = {
        value: 'any-time',
        label: 'GT_MEDIA_DATE_ANY_TIME',
    }

    private mediaDates: BehaviorSubject<{value: string, label: string}[]> = new BehaviorSubject<{value: string, label: string}[]>([
      { value: 'any-time', label: 'GT_MEDIA_DATE_ANY_TIME' },
      { value: 'last-24h', label: 'GT_MEDIA_DATE_LAST_24_HOURS' },
      { value: 'last-48h', label: 'GT_MEDIA_DATE_LAST_48_HOURS' },
      { value: 'last-72h', label: 'GT_MEDIA_DATE_LAST_72_HOURS' },
      { value: 'last-7days', label: 'GT_MEDIA_DATE_LAST_7_DAYS' },
      { value: 'last-30days', label: 'GT_MEDIA_DATE_LAST_30_DAYS' },
      { value: 'last-12months', label: 'GT_MEDIA_DATE_LAST_12_MONTHS' },
    ])

    private selectedDate: BehaviorSubject<{value: string, label: string}> = new BehaviorSubject<{value: string, label: string}>(
      this.defaultDateFilter
    )

    constructor(
        private bakeryManagementService: BakeryManagementService,
    ) {}

    ngOnDestroy() {
        this.onDestroy.next()
        this.onDestroy.complete()
    }

    getMediaDates() {
        return this.mediaDates.asObservable()
    }

    // getMediaProjects() {
    //     return this.mediaProjects.asObservable()
    // }

    getSelectedDate() {
        return this.selectedDate.asObservable()
    }

    // getSelectedProjects() {
    //     return this.selectedProjects.asObservable()
    // }

    getSearchOptions(): SearchOptions {
        return this.bakeryManagementService.navigationContext.searchOptions
    }

    getSearchQuery(): string {
        return this.bakeryManagementService.navigationContext.filters.queryString || ''
    }

    // loadMoreProjects() {
    //     this.getPaginatedProjects()
    // }

    // projectSearchChange(data: string) {
    //     this.projectSearchQuery = data
    //     this.mediaProjects.next([])
    //     this.hasMoreProjectsToLoad.next(true)
    //     this.getPaginatedProjects()
    // }

    setSearchOptions(searchOptions: SearchOptions) {
        this.bakeryManagementService.navigationContext.searchOptions = searchOptions
        this.onApplyFilters()
    }

    setSearchQuery(searchQuery: string) {
        if (searchQuery !== this.bakeryManagementService.navigationContext.filters.queryString) {
            this.bakeryManagementService.navigationContext.filters.queryString = searchQuery
            this.onApplyFilters()
        }
    }

    applyDateFilter(data: {value: string, label: string}) {
        this.selectedDate.next(data)
        this.applyFiltersDebounced()
    }

    /* istanbul ignore next */
    // applyProjectFilters(data: AdvancedSelection) {
    //     this.projectSelectSubject.next(data)
    // }

    // applyProjectFiltersImmediately(data: AdvancedSelection[]) {
    //     this.applyAdvancedFilters(data, this.selectedProjects)
    // }

    clearFilters() {
        // this.selectedProjects.next([])
        this.selectedDate.next(this.defaultDateFilter)
        this.bakeryManagementService.clearFilters()
    }

    getMediaLibraryFilterResults(): Observable<{value: string, label: string}[]> {
        // return this.getBaseFilterResults().pipe(
        //     combineLatestWith(this.selectedProjects,),
        //     map(([previous, projects, tags]) => [...previous, ...projects, ...tags]),
        //     distinctUntilChanged(
        //         (previous, current) =>
        //             previous.length === current.length &&
        //             previous.every((value, index) => value === current[index])
        //     )
        // )
        return this.getBaseFilterResults()
    }

    hasFiltered(): Observable<boolean> {
        return this.getMediaLibraryFilterResults().pipe(map((results) => results.length > 0))
    }

    hasSearched(): boolean {
        return (
            (this.bakeryManagementService.navigationContext.filters.queryString !== undefined &&
                this.bakeryManagementService.navigationContext.filters.queryString.length > 0)
        )
    }

    private updateFiltersBasedOnSearchQuery() {
        // if (this.bakeryManagementService.navigationContext.filters.projects) {
        //     this.selectedProjects.next(this.bakeryManagementService.navigationContext.filters.projects)
        // }

        this.selectedDate.next(
            this.mediaDates.value.find(
                (f) => f.value === this.bakeryManagementService.navigationContext.filters.date
            ) || this.defaultDateFilter
        )
    }

    private getBaseFilterResults(): Observable<{value: string, label: string}[]> {
        // can add other base filters in the future
        return this.getSelectedDateFilterResults();
    }

    private getSelectedDateFilterResults(): Observable<{value: string, label: string}[]> {
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
    // private subscribeToProjectSelectSubject() {
    //     this.projectSelectSubject
    //         .pipe(bufferTime(800), takeUntil(this.onDestroy))
    //         .subscribe((data: AdvancedSelection[]) => {
    //             if (data.length > 0) {
    //                 this.applyProjectFiltersImmediately(data)
    //             }
    //         })
    // }

    // private applyAdvancedFilters(
    //     selectedFilters: AdvancedSelection[],
    //     currentlySelectedFilters: BehaviorSubject<{value: string, label: string}[]>
    // ) {
    //     //makes a copy of the current selected filters
    //     let temporarySelectedFilters = [...currentlySelectedFilters.value]
    //     //adds/removes the selected filters from the copy
    //     selectedFilters.forEach((selectedFilter: AdvancedSelection) => {
    //         if (
    //             selectedFilter.selected &&
    //             !temporarySelectedFilters.some(
    //                 (project) => project.value === selectedFilter.value.value
    //             )
    //         ) {
    //             temporarySelectedFilters.push(selectedFilter.value)
    //         } else if (!selectedFilter.selected) {
    //             temporarySelectedFilters = temporarySelectedFilters.filter(
    //                 (temporaryProject) => temporaryProject.value !== selectedFilter.value.value
    //             )
    //         }
    //     })
    //     //checks if the copy is different from the current selected filters
    //     const isChanged = this.haveFiltersChanged(
    //         temporarySelectedFilters,
    //         currentlySelectedFilters.value
    //     )
    //     // applies the filters if they are different
    //     if (isChanged) {
    //         currentlySelectedFilters.next(temporarySelectedFilters)
    //         this.applyFilters()
    //     }
    // }

    // checks if the temporary selected filters are different from the current selected filters
    private haveFiltersChanged(
        temporaryFilterArray: {value: string, label: string}[],
        selectedFilterArray: {value: string, label: string}[]
    ): boolean {
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
        // this.bakeryManagementService.navigationContext.filters.projectIds =
        //     this.selectedProjects.value.map((f) => f.value)
        // this.bakeryManagementService.navigationContext.filters.projects = this.selectedProjects.value
        this.bakeryManagementService.navigationContext.filters.date = this.selectedDate.value.value

        this.onApplyFilters()
    }

    private onApplyFilters() {
        this.bakeryManagementService.navigationContext.getCount = true
        this.bakeryManagementService.updateProductList(true).subscribe()
    }

    // private getPaginatedProjects() {
    //     this.projectsLoading.next(true)
    //     this.bakeryManagementService
    //         .getProjectFiltersForMedia(this.mediaProjects.value.length, this.projectSearchQuery)
    //         .pipe(
    //             take(1),
    //             map((projectList: ProjectFiltersResponse[]) => {
    //                 this.hasMoreProjectsToLoad.next(projectList.length !== 0)
    //                 this.addProjectsToSelectionList(projectList)
    //                 this.selectedProjects.next([...this.selectedProjects.value])
    //                 this.projectsLoading.next(false)
    //             })
    //         )
    //         .subscribe()
    // }

    // private addProjectsToSelectionList(projectList: ProjectFiltersResponse[]) {
    //     const newMediaProjects: {value: string, label: string}[] = []
    //     projectList.forEach((project) =>
    //         newMediaProjects.push({
    //             value: project.id,
    //             label: project.title,
    //             count: project.mediaCount,
    //         })
    //     )
    //     this.mediaProjects.next([...this.mediaProjects.value, ...newMediaProjects])
    // }
}
