import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
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
import { Subject, debounceTime, takeUntil } from 'rxjs'
import { AppFilter } from 'src/app/shared/components/filters/filter.component'
import { MAT_SELECT_CONFIG, MatSelect } from '@angular/material/select'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { AdvancedSelection } from 'src/app/shared/models/advanced-selection.model'
import { MatFormField, MatPrefix, MatLabel, MatSuffix } from '@angular/material/form-field'
import { NgStyle, NgIf, NgFor } from '@angular/common'
import { MatIcon } from '@angular/material/icon'
import { MatOption } from '@angular/material/core'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { MatInput } from '@angular/material/input'

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
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        NgStyle,
        NgIf,
        MatIcon,
        MatSelect,
        MatOption,
        MatProgressSpinner,
        MatPrefix,
        MatLabel,
        MatInput,
        MatSuffix,
        NgFor,
    ],
})
export class AdvancedTextFilterComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    constructor(private fb: FormBuilder) {}

    @Input() labelTK = ''
    @Input() searchForTK?: string
    @Input() noResultsTK?: string
    @Input() fields!: FilterOption[]
    @Input() selection!: FilterOption[]
    @Input() customLabelWidth?: string
    @Input() loading = false
    @Input() loadingPage?: boolean
    @Input() hasMoreItems?: boolean
    @Input() panelClass = ''
    @Output() selectionChange = new EventEmitter<AdvancedSelection>()
    @Output() searchChange = new EventEmitter<string>()
    @Output() loadMore = new EventEmitter()
    @Output() openedChange = new EventEmitter<boolean>()
    @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<unknown>
    @ViewChild('advancedTextFilterSelect') advancedTextFilterSelect!: MatSelect

    // how many pixels from the bottom of the scrollable panel to trigger the loadMore event
    private readonly THRESHOLD = 3.0
    form!: FormGroup
    private selectionSubject = new Subject<AdvancedSelection>()
    private searchSubject = new Subject<string>()
    onDestroy = new Subject<void>()
    searchQuery = ''

    ngOnInit() {
        this.form = this.fb.group({
            fields: new FormControl([]),
        })
        this.form.patchValue({ fields: this.selection })
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
                if (!this.fields.length && this.hasMoreItems) {
                    this.loadMore.emit()
                }
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
            this.form.patchValue({ fields: this.selection })
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
        const panel = <HTMLElement>this.advancedTextFilterSelect.panel.nativeElement
        panel.addEventListener('scroll', (event: Event) => {
            if (
                event.target &&
                this.hasScrolledToBottom(event.target as Element) &&
                this.hasMoreItems &&
                !this.loadingPage
            ) {
                this.loadMore.emit()
            }
        })
    }

    /* istanbul ignore next: not possible to test due to <ng-template> not rendering on testing */
    private hasScrolledToBottom(target: Element): boolean {
        return (
            Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < this.THRESHOLD
        )
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
