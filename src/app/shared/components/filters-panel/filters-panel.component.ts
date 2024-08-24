import {
    AfterViewInit,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    Output,
    QueryList,
} from '@angular/core'
import { AppFilterPanel } from 'src/app/shared/components/filters-panel/filter-panel.component'
import { NgFor, NgTemplateOutlet } from '@angular/common'

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

    @Input() set filters(filters: Record<string, string[]>) {
        this._filters = filters
        this.filterChildren?.forEach((filter) => {
            filter.selection = filters[filter.field]
        })
    }
    get filters() {
        return this._filters
    }

    @Output() filtersChange = new EventEmitter<Record<string, string[]>>()

    /**
     * @description list of the filters to use
     */
    @ContentChildren(AppFilterPanel) filterChildren!: QueryList<AppFilterPanel>

    ngAfterViewInit() {
        this.filterChildren.forEach((filter) => {
            filter.selection = this.filters[filter.field]
            filter.selectionChange.subscribe((selection) => {
                this.filters[filter.field] = selection
                this.filtersChange.emit(this.filters)
            })
        })
    }
}
