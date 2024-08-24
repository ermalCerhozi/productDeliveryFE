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

import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { MatChipListbox, MatChipOption, MatChipRemove } from '@angular/material/chips';
import { NgFor, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-filters-result',
    templateUrl: './filters-result.component.html',
    styleUrls: ['./filters-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatChipListbox,
        NgFor,
        MatChipOption,
        NgIf,
        MatChipRemove,
        MatIcon,
    ],
})
export class FiltersResultComponent implements OnInit, OnChanges {
    @Input() labelTK?: string
    @Input() results!: FilterOption[] | null

    @Output() clearResults = new EventEmitter()
    @Output() removeFilter = new EventEmitter<FilterOption>()

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

    onRemoveFilter(item: FilterOption) {
        this.form.patchValue(
            this.form.value.results.filter((f: FilterOption) => f.value !== item.value)
        )
        this.removeFilter.emit(item)
    }
}
