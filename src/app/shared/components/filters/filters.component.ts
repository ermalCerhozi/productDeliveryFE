import { Component, ContentChildren, QueryList, contentChildren } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgFor, NgTemplateOutlet } from '@angular/common'

import { AppFilter } from 'src/app/shared/components/filters/filter.component'

/**
 * @description component to display a list of filters
 * @example
 * <app-filters>
 *    <app-simple-text-filter
 *      [fields]="fields"
 *      [selection]="['image', 'audio']"
 *      [labelTK]="labelTK"
 *      (selectionChange)="onSelectionChange()"
 *   >
 * </app-filter>
 */
@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    standalone: true,
    imports: [FormsModule, NgFor, NgTemplateOutlet],
})
export class FiltersComponent {
    /**
     * @description list of the filters to use
     */
    filters = contentChildren(AppFilter)
}
