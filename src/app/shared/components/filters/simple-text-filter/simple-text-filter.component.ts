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
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import { NgStyle, NgIf, NgFor } from '@angular/common'

import { MatIconButton } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import { MatFormField } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { MAT_SELECT_CONFIG, MatSelect } from '@angular/material/select'

import { AppFilter } from 'src/app/shared/components/filters/filter.component'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
@Component({
    selector: 'app-simple-text-filter',
    templateUrl: './simple-text-filter.component.html',
    styleUrls: ['./simple-text-filter.component.scss'],
    providers: [
        { provide: AppFilter, useExisting: SimpleTextFilterComponent },
        {
            provide: MAT_SELECT_CONFIG,
            useValue: { overlayPanelClass: 'mef-simple-text-filter-overlay', panelWidth: null },
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
        NgFor,
        MatIconButton,
    ],
})
export class SimpleTextFilterComponent implements OnInit, OnChanges {
    constructor(private fb: FormBuilder) {}

    @Input() labelTK = ''
    @Input() fields?: FilterOption[] = []
    @Input() field = ''
    @Input() selection!: FilterOption[] | FilterOption
    @Input() customLabelWidth?: string
    @Input() loading = false
    @Input() multiple = false
    @Input() panelClass = ''
    @Input() enableAllOption = false
    @Input() enableOnlyButton = false
    @Input() allowEmptySelection = true
    @Input() disabled = false
    @Input() showCheck: boolean | undefined
    @Output() selectionChange = new EventEmitter<FilterOption[] | FilterOption>()
    @Output() openedChange = new EventEmitter<boolean>()
    @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<unknown>
    form!: FormGroup

    /** Boolean used to show the 'All' option (enableAllOption is not enough) */
    hasAllOption = false
    allOption!: FilterOption
    optionsWithoutAll: FilterOption[] = []
    isAllSelected = false

    /** Boolean used to show the 'Only' button (enableOnlyButton is not enough) */
    hasOnlyButton = false

    ngOnInit() {
        this.form = this.fb.group({
            fields: new FormControl(),
        })

        if (this.fields && this.multiple) {
            this.hasAllOption = this.enableAllOption
            this.hasOnlyButton = this.enableOnlyButton
        }

        if (this.hasAllOption) {
            /* istanbul ignore next */
            const allOption = this.fields?.find((field) => field.value === 'all')

            /* istanbul ignore next: guard for filters init with 'all' option */
            if (!allOption) {
                throw new Error("Cannot find a filter option with value 'all'")
            }

            this.allOption = allOption
        }
        /* istanbul ignore next */
        this.optionsWithoutAll = this.fields?.filter((field) => field.value !== 'all') || []

        this.setFormValue(this.selection)
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.form && changes['selection']) {
            const selection = changes['selection'].currentValue
            this.setFormValue(selection)
        }
    }

    onSelectionChange() {
        if (this.hasAllOption) {
            this.checkOrUncheckAll(this.form.value.fields, this.isAllSelected)
        }

        if (!this.allowEmptySelection) {
            this.resetEmptySelection(this.form.value.fields)
        }

        this.emitSelectionChange()
    }

    onOpenedChange(isOpen: boolean) {
        this.openedChange.emit(isOpen)
    }

    /* istanbul ignore next */
    compareValues(o1: FilterOption, o2: FilterOption) {
        return o1 && o2 ? o1.value === o2.value : o1 === o2
    }

    selectOnlyOne(event: MouseEvent, selectedOption: FilterOption) {
        event.stopPropagation()
        this.setFormValue([selectedOption])
        this.emitSelectionChange()
    }

    private emitSelectionChange() {
        const selection = this.formValueToSelection(this.form.value.fields)
        this.selectionChange.emit(selection)
    }

    /**
     * Set the form value with a given selection.
     */
    private setFormValue(selection: FilterOption[] | FilterOption) {
        let formValue

        if (!selection) {
            formValue = this.getEmptyFormValue()
        } else {
            formValue = this.selectionToFormValue(selection)
        }

        this.form.patchValue({ fields: formValue }, { emitEvent: false })

        if (this.hasAllOption) {
            formValue = formValue as FilterOption[]
            this.isAllSelected = formValue.some((opt) => opt.value === 'all')
        }
    }

    /**
     * Check or uncheck the 'All' option depending on the form value.
     */
    private checkOrUncheckAll(selection: FilterOption[], wasAllSelected: boolean) {
        const isAllSelected = selection.some((opt) => opt.value === 'all')
        const selectionWithoutAll = selection.filter((opt) => opt.value !== 'all')
        let newSelection = [...selection]

        // If 'all' option just have been selected, we select everything
        if (!wasAllSelected && isAllSelected) {
            newSelection = [this.allOption]
            this.setFormValue(newSelection)
            return
        }

        // If every option have been selected, we add the 'all' option
        if (!isAllSelected && selectionWithoutAll.length === this.optionsWithoutAll.length) {
            newSelection = [this.allOption]
        }

        // If 'all' option is selected and one option is missing, we remove the 'all' option
        if (isAllSelected && selectionWithoutAll.length !== this.optionsWithoutAll.length) {
            newSelection = [...selectionWithoutAll]
        }

        this.setFormValue(newSelection)
    }

    private resetEmptySelection(selection: FilterOption[]) {
        let newSelection = [...selection]
        if (selection.length === 0) {
            /* istanbul ignore if: case when allowEmptySelection is false & enableAllOption is true */
            if (this.allOption) {
                newSelection = [this.allOption]
            } else {
                newSelection = [...this.optionsWithoutAll]
            }
            this.setFormValue(newSelection)
        }
    }

    /* istanbul ignore next */
    private getEmptyFormValue(): FilterOption[] | FilterOption {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.multiple ? [] : this.fields![0]
    }

    /*
     * The 'All' selection is represented in 2 different ways:
     *   - at form level, it's an array containing 'All' option + the other values
     *   - outside the component, it's an array containing only 'All' option
     *
     * These methods allow switching between both.
     */

    private formValueToSelection(
        options: FilterOption[] | FilterOption
    ): FilterOption[] | FilterOption {
        if (Array.isArray(options) && this.hasAllOption) {
            const allSelected = options.some((opt) => opt.value === 'all')
            if (allSelected) {
                return [this.allOption]
            }
        }
        return options
    }

    private selectionToFormValue(
        options: FilterOption[] | FilterOption
    ): FilterOption[] | FilterOption {
        if (this.multiple) {
            /* istanbul ignore next: guard for selection initialization */
            if (!Array.isArray(options)) {
                throw new Error('Multiple selection must be an array')
            }

            if (this.hasAllOption && options.includes(this.allOption)) {
                return [this.allOption, ...this.optionsWithoutAll]
            }
        }

        return options
    }
}
