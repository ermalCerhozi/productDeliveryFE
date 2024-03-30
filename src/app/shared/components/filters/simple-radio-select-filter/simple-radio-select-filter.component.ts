import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MAT_SELECT_CONFIG } from '@angular/material/select'
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
})
export class SimpleRadioSelectFilterComponent implements OnInit, OnChanges {
    constructor(private fb: FormBuilder) {}

    @Input() labelTK = ''
    @Input() fields?: FilterOption[]
    @Input() defaultEmptyValue?: FilterOption
    @Input() selection!: FilterOption
    @Input() customLabelWidth?: string
    @Input() panelClass = ''
    @Output() selectionChange = new EventEmitter<FilterOption>()
    @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<unknown>
    form!: FormGroup

    ngOnInit() {
        this.form = this.fb.group({
            fields: new FormControl([]),
        })
        this.form.setValue({ fields: this.selection })
    }

    ngOnChanges(changes: SimpleChanges) {
        const { selection } = changes
        if (this.form && selection && !selection.firstChange) {
            this.form.setValue({ fields: selection.currentValue })
        }
    }

    onSelectionChange(event: { value: FilterOption }) {
        this.selection = event.value
        this.selectionChange.emit(event.value)
    }

    compareValues(o1: FilterOption, o2: FilterOption): boolean {
        return o1.value === o2.value
    }
}
