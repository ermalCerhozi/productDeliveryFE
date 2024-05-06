import { TemplateRef } from '@angular/core'

/**
 * @class App filter component class
 * It can be used as a base class for any filter component such as `SimpleFilterComponent`, `AdvancedFilterComponent`, etc.
 * How to use:
 *   @Component({
 *     selector: 'mef-dummy-filter',
 *     templateUrl: './dummy-filter.component.html',
 *     styleUrls: ['./dummy-filter.component.scss'],
 *     providers: [{ provide: MefFilter, useExisting: MefDummyFilter }],
 *   })
 *  export class MefDummyFilter {
 *    @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<unknown>
 *  }
 */
export class AppFilter {
    /**
     * @property templateRef - Template reference
     */
    templateRef!: TemplateRef<unknown>
}
