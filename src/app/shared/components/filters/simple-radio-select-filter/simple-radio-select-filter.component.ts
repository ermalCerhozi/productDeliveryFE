import {
    Component,
    inject,
    input,
    OnChanges,
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
import { NgStyle, NgIf, NgFor } from '@angular/common'

import { MatOption } from '@angular/material/core'
import { MatFormField } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MAT_SELECT_CONFIG, MatSelect } from '@angular/material/select'

import { AppFilter } from 'src/app/shared/components/filters/filter.component'
import { FilterOption } from 'src/app/shared/models/filter-option.model'

@Component({
    selector: 'app-simple-radio-select-filter',
    templateUrl: './simple-radio-select-filter.component.html',
    styleUrls: ['./simple-radio-select-filter.component.scss'],
    providers: [
        { provide: AppFilter, useExisting: SimpleRadioSelectFilterComponent },
        {
            provide: MAT_SELECT_CONFIG,
            useValue: {
                overlayPanelClass: 'mef-simple-radio-select-filter-overlay',
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
        NgIf,
        MatIcon,
        MatSelect,
        NgFor,
        MatOption,
    ]
})
export class SimpleRadioSelectFilterComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder)

    labelTK = input('')
    fields = input<FilterOption[]>()
    defaultEmptyValue = input<FilterOption>()
    selection = input.required<FilterOption>()
    customLabelWidth = input<string>()
    panelClass = input('')
    selectionChange = output<FilterOption>()
    @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<unknown>
    form!: FormGroup

    ngOnInit() {
        this.form = this.fb.group({
            fields: new FormControl([]),
        })
        this.form.setValue({ fields: this.selection() })
    }

    ngOnChanges(changes: SimpleChanges) {
        const { selection } = changes
        if (this.form && selection && !selection.firstChange) {
            this.form.setValue({ fields: selection.currentValue })
        }
    }

    onSelectionChange(event: { value: FilterOption }) {
        this.selectionChange.emit(event.value)
    }

    compareValues(o1: FilterOption, o2: FilterOption): boolean {
        return o1.value === o2.value
    }
}
