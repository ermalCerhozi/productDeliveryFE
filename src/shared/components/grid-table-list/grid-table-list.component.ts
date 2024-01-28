import {
    AfterViewChecked,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core'

export type GridListScrollType = 'default' | 'infinite' | 'virtual'

@Component({
    selector: 'app-grid-table-list',
    templateUrl: './grid-table-list.component.html',
    styleUrls: ['./grid-table-list.component.css'],
})
export class GridTableListComponent implements AfterViewChecked, OnChanges {
    @Input() minItemHeight = 100
    @Input() minItemWidth = 100
    @Input() gutterSize = 32
    @Input() scrollType: GridListScrollType = 'default'
    @Input() items: unknown[] = []

    @Output() infiniteScrollDown = new EventEmitter<void>()
    @Output() infiniteScrollUp = new EventEmitter<void>()

    @ContentChild('emptyState') emptyStateTemplate!: TemplateRef<unknown>
    @ContentChild('listItem') itemTemplate!: TemplateRef<unknown>
    @ViewChild('gridViewport', { static: false }) viewport!: ElementRef

    gridColumns = 1
    baseItemHeight = 0

    ngOnChanges() {
        this.computeGridColumns()
    }

    ngAfterViewChecked() {
        this.computeGridColumns()
    }

    onInfiniteScrollDown() {
        console.log('Scrolling down')
        this.infiniteScrollDown.emit()
    }

    onInfiniteScrollUp() {
        console.log('Scrolling up')
        this.infiniteScrollUp.emit()
    }

    /* istanbul ignore next: not easy to test */
    onResizeViewport() {
        this.computeGridColumns()
    }

    private computeGridColumns() {
        if (!this.viewport) {
            this.gridColumns = 1
            this.baseItemHeight = this.minItemHeight
            return
        }

        // Compute the number of columns that can fit in the viewport
        // For n columns, the width of the grid viewport is n * minItemWidth + (n - 1) * gutterSize
        // So n = (viewportWidth + gutterSize) / (minItemWidth + gutterSize)
        const viewportWidth = this.viewport.nativeElement.clientWidth
        const a = viewportWidth + this.gutterSize
        const b = this.minItemWidth + this.gutterSize
        const n = Math.floor(a / b)

        /* istanbul ignore next: not easy to test */
        this.gridColumns = n > 0 ? n : 1
        this.baseItemHeight = Math.floor((this.minItemHeight + this.gutterSize) / n)
    }
}
