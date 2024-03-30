import { EventEmitter, TemplateRef } from '@angular/core'

/**
 * @class Mef filter panel component class
 * It can be used as a base class for any filter component such as `SimpleFilterPanelComponent`, `AdvancedFilterPanelComponent`, etc.
 * How to use:
 *   @Component({
 *     selector: 'mef-dummy-filter-panel',
 *     templateUrl: './dummy-filter-panel.component.html',
 *     styleUrls: ['./dummy-filter-panel.component.scss'],
 *     providers: [{ provide: MefFilterPanel, useExisting: MefDummyFilterPanel }],
 *   })
 *  export class MefDummyFilterPanel extends MefFilterPanel {
 *    @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<unknown>
 *  }
 */
export abstract class AppFilterPanel {
    templateRef!: TemplateRef<unknown>

    abstract selection: string[]

    field!: string

    selectionChange = new EventEmitter<string[]>()
}
