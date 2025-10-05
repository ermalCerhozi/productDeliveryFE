import {
    AfterViewInit,
    Component,
    inject,
    input,
    OnChanges,
    OnDestroy,
    OnInit,
    output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import { NgStyle } from '@angular/common'

import { Subject, debounceTime, takeUntil } from 'rxjs'
import { MatOption } from '@angular/material/core'
import { MatFormField, MatPrefix, MatLabel, MatSuffix } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { MAT_SELECT_CONFIG, MatSelect } from '@angular/material/select'

import { AppFilter } from 'src/app/shared/components/filters/filter.component'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { AdvancedSelection } from 'src/app/shared/models/advanced-selection.model'

@Component({
    selector: 'app-advanced-text-filter',
    templateUrl: './advanced-text-filter.component.html',
    styleUrls: ['./advanced-text-filter.component.scss'],
    providers: [
        { provide: AppFilter, useExisting: AdvancedTextFilterComponent },
        {
            provide: MAT_SELECT_CONFIG,
            useValue: {
                overlayPanelClass: 'mef-advanced-text-filter-overlay',
                panelWidth: null,
            },
        },
    ],
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        NgStyle,
        MatIcon,
        MatSelect,
        MatOption,
        MatProgressSpinner,
        MatPrefix,
        MatLabel,
        MatInput,
        MatSuffix,
    ],
})
export class AdvancedTextFilterComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    private fb = inject(FormBuilder)

    labelTK = input('')
    searchForTK = input<string>()
    noResultsTK = input<string>()
    fields = input.required<FilterOption[]>()
    selection = input.required<FilterOption[]>()
    customLabelWidth = input<string>()
    loading = input(false)
    loadingPage = input<boolean>()
    hasMoreItems = input<boolean>()
    panelClass = input('')
    selectionChange = output<AdvancedSelection>()
    searchChange = output<string>()
    loadMore = output()
    openedChange = output<boolean>()
    @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<unknown>
    @ViewChild('advancedTextFilterSelect') advancedTextFilterSelect!: MatSelect

    // how many pixels from the bottom of the scrollable panel to trigger the loadMore event
    // Setting to 1 to trigger only when truly at the bottom
    private THRESHOLD = 1.0
    form!: FormGroup
    private selectionSubject = new Subject<AdvancedSelection>()
    private searchSubject = new Subject<string>()
    onDestroy = new Subject<void>()
    searchQuery = ''
    private scrollListenerAttached = false
    private isLoadingMore = false

    ngOnInit() {
        this.form = this.fb.group({
            fields: new FormControl([]),
        })
        this.form.patchValue({ fields: this.selection() })
        /* istanbul ignore next: not possible to test due to <ng-template> not rendering on testing */
        this.selectionSubject.pipe(takeUntil(this.onDestroy)).subscribe((selection) => {
            this.selectionChange.emit(selection)
        })
        this.searchSubject
            .pipe(debounceTime(800), takeUntil(this.onDestroy))
            .subscribe((value: string) => {
                this.searchChange.emit(value)
            })
    }

    /* istanbul ignore next: not possible to test due to <ng-template> not rendering on testing */
    ngAfterViewInit() {
        this.advancedTextFilterSelect?.openedChange.subscribe((isOpen) => {
            if (isOpen) {
                this.subscribeScrollEvent()
                // Note: Initial load is now handled by parent component via openedChange event
                // This prevents double loading
            } else {
                // Reset scroll listener flag when closed
                this.scrollListenerAttached = false
            }
        })

        this.advancedTextFilterSelect?.optionSelectionChanges.subscribe((event) => {
            const clientSelection: AdvancedSelection = {
                value: event.source.value,
                selected: event.source.selected,
            }
            this.selectionSubject.next(clientSelection)
        })
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.form && (changes['selection'] || changes['fields'])) {
            this.form.patchValue({ fields: this.selection() })
        }
    }

    onOpenedChange(isOpen: boolean) {
        this.openedChange.emit(isOpen)
    }

    compareObjects(o1: FilterOption, o2: FilterOption) {
        return o1.value === o2.value
    }

    /* istanbul ignore next: not possible to test due to <ng-template> not rendering on testing */
    subscribeScrollEvent() {
        // Prevent multiple listeners from being attached
        if (this.scrollListenerAttached) {
            return
        }

        // Use setTimeout to ensure panel is fully rendered
        setTimeout(() => {
            try {
                const panel = this.advancedTextFilterSelect?.panel?.nativeElement
                if (!panel) {
                    console.warn('Panel not found')
                    return
                }
                
                const scrollHandler = (event: Event) => {
                    const target = event.target as Element
                    
                    if (
                        this.hasScrolledToBottom(target) &&
                        this.hasMoreItems() &&
                        !this.loadingPage() &&
                        !this.isLoadingMore
                    ) {
                        console.log('Scroll reached bottom, loading more items...')
                        this.isLoadingMore = true
                        this.loadMore.emit()
                        
                        // Reset flag after a short delay to prevent rapid firing
                        setTimeout(() => {
                            this.isLoadingMore = false
                        }, 500)
                    }
                }

                panel.addEventListener('scroll', scrollHandler, { passive: true })
                this.scrollListenerAttached = true
                
                console.log('Scroll listener attached to panel', {
                    scrollHeight: panel.scrollHeight,
                    clientHeight: panel.clientHeight,
                    hasScroll: panel.scrollHeight > panel.clientHeight
                })
            } catch (error) {
                console.error('Error attaching scroll listener:', error)
            }
        }, 0)
    }

    /* istanbul ignore next: not possible to test due to <ng-template> not rendering on testing */
    private hasScrolledToBottom(target: Element): boolean {
        const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight
        const isAtBottom = scrollBottom <= this.THRESHOLD
        return isAtBottom
    }

    ngOnDestroy() {
        this.onDestroy.next()
        this.onDestroy.complete()
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchQuery)
    }

    clearSearch() {
        this.searchQuery = ''
        this.searchSubject.next(this.searchQuery)
    }
}
