import { Component, ContentChildren, QueryList } from '@angular/core'
import { AppFilter } from 'src/app/shared/components/filters/filter.component'

/**
 * @description component to display a list of filters
 * @example
 * <mef-filters>
 *    <mef-simple-text-filter
 *      [fields]="fields"
 *      [selection]="['image', 'audio']"
 *      [labelTK]="labelTK"
 *      (selectionChange)="onSelectionChange()"
 *   >
 * </mef-filter>
 */
@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent {
    /**
     * @description list of the filters to use
     */
    @ContentChildren(AppFilter) filters?: QueryList<AppFilter>
}
