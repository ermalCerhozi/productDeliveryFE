import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'

@Component({
    selector: 'app-filters-result',
    templateUrl: './filters-result.component.html',
    styleUrls: ['./filters-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersResultComponent implements OnInit, OnChanges {
    @Input() labelTK?: string
    @Input() results!: string[]

    @Output() clearResults = new EventEmitter()
    @Output() removeFilter = new EventEmitter<string>()

    constructor(private fb: FormBuilder) {}

    form!: FormGroup

    ngOnInit() {
        this.form = this.fb.group({
            results: new FormControl([]),
        })
        this.form.patchValue({ results: this.results })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.form && changes['results']) {
            this.form.patchValue({ results: changes['results'].currentValue })
        }
    }

    clearFilters() {
        this.form.reset()
        this.clearResults.emit()
    }

    onRemoveFilter(item: string) {
        this.form.patchValue(this.form.value.results.filter((f: string) => f !== item))
        this.removeFilter.emit(item)
    }
}
