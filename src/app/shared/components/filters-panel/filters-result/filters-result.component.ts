import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    OnChanges,
    OnInit,
    output,
    SimpleChanges,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { NgFor, NgIf } from '@angular/common'

import { MatChipListbox, MatChipOption, MatChipRemove } from '@angular/material/chips'
import { MatIcon } from '@angular/material/icon'

import { FilterOption } from 'src/app/shared/models/filter-option.model'

@Component({
    selector: 'app-filters-result',
    templateUrl: './filters-result.component.html',
    styleUrls: ['./filters-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatChipListbox, NgFor, MatChipOption, NgIf, MatChipRemove, MatIcon]
})
export class FiltersResultComponent implements OnInit, OnChanges {
    labelTK = input<string>()
    results = input<FilterOption[] | null>(null)

    clearResults = output()
    removeFilter = output<FilterOption>()

    private fb = inject(FormBuilder)

    form!: FormGroup

    ngOnInit() {
        this.form = this.fb.group({
            results: new FormControl([]),
        })
        this.form.patchValue({ results: this.results() })
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

    onRemoveFilter(item: FilterOption) {
        this.form.patchValue(
            this.form.value.results.filter((f: FilterOption) => f.value !== item.value)
        )
        this.removeFilter.emit(item)
    }
}
