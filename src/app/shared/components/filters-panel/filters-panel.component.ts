import {
    AfterViewInit,
    Component,
    ContentChildren,
    effect,
    input,
    output,
    QueryList,
} from '@angular/core'
import { NgFor, NgTemplateOutlet } from '@angular/common'

import { AppFilterPanel } from 'src/app/shared/components/filters-panel/filter-panel.component'

/**
 * @description component to display a list of filters
 * @example
    <mef-filters-panel [filters]="filters" (filtersChange)="onFiltersChange($event)">
        <mef-select-filter-panel
            [title]="title"
            [options]="optionsAssignee"
            [stickyOptions]="stickyOptionsAssignee"
            field="assignee"
        >
        </mef-select-filter-panel>
    </mef-filters-panel>
 */
@Component({
    selector: 'app-filters-panel',
    templateUrl: './filters-panel.component.html',
    styleUrls: ['./filters-panel.component.scss'],
    standalone: true,
    imports: [NgFor, NgTemplateOutlet],
})
export class FiltersPanelComponent implements AfterViewInit {
    private _filters!: Record<string, string[]>

    filters = input<Record<string, string[]>>({})

    filtersChange = output<Record<string, string[]>>()

    /**
     * @description list of the filters to use
     */
    @ContentChildren(AppFilterPanel) filterChildren!: QueryList<AppFilterPanel>

    constructor() {
        effect(() => {
            const filters = this.filters()
            this._filters = filters
            this.filterChildren?.forEach((filter) => {
                filter.selection = filters[filter.field]
            })
        })
    }

    ngAfterViewInit() {
        this.filterChildren.forEach((filter) => {
            filter.selection = this._filters[filter.field]
            filter.selectionChange.subscribe((selection) => {
                this._filters[filter.field] = selection
                this.filtersChange.emit(this._filters)
            })
        })
    }
}
