// import { I18NextService } from 'angular-i18next'
// import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks'

// import { GridTableListComponent } from 'src/shared/components/grid-table-list/grid-table-list.component'
// import { SharedModule } from '@app/shared/shared.module'
// import { MockTranslationService } from '@app/shared/utils/mockTranslationService'

// describe('GridTableListComponent', () => {
//     MockInstance.scope()

//     const items = Array.from({ length: 10 }, (_, i) => i + 1)

//     beforeEach(() =>
//         MockBuilder(GridTableListComponent, SharedModule).provide({
//             provide: I18NextService,
//             useClass: MockTranslationService,
//         })
//     )

//     it('should create', () => {
//         const fixture = MockRender(GridTableListComponent, {})
//         expect(fixture.point.componentInstance).toBeDefined()
//     })

//     describe('Item display', () => {
//         const template = `
//             <mef-grid-list [items]="items" [scrollType]="scrollType">
//                 <ng-template #listItem let-item="item">
//                     <div class="grid-item">
//                         {{ item }}
//                     </div>
//                 </ng-template>
//                 <ng-template #emptyState>
//                     <div class="empty-state">
//                         Empty
//                     </div>
//                 </ng-template>
//             </mef-grid-list>
//         `

//         it('should display item template for each item', () => {
//             MockRender<GridTableListComponent>(template, { items, scrollType: 'default' })

//             const gridItems = ngMocks.findAll('.grid-item')
//             const emptyState = ngMocks.find('.empty-state', null)
//             expect(gridItems.length).toBe(items.length)
//             expect(emptyState).toBeNull()
//         })

//         it('should display empty state template when items is empty', () => {
//             MockRender<GridTableListComponent>(template, { items: [], scrollType: 'default' })

//             const gridItems = ngMocks.findAll('.grid-item')
//             const emptyState = ngMocks.find('.empty-state')
//             expect(gridItems.length).toBe(0)
//             expect(emptyState).toBeDefined()
//         })
//     })

//     describe('Infinite scrolling', () => {
//         const template = `
//             <mef-grid-list
//                 [items]="items"
//                 [scrollType]="scrollType"
//                 (infiniteScrollDown)="infiniteScrollDown()"
//                 (infiniteScrollUp)="infiniteScrollUp()"
//             >
//                 <ng-template #listItem let-item="item">
//                     <div class="grid-item">
//                         {{ item }}
//                     </div>
//                 </ng-template>
//             </mef-grid-list>
//         `

//         it('should emit "infiniteScrollDown" when scroll reach bottom of the grid', () => {
//             const scrollDownSpy = jest.fn()
//             MockRender<GridTableListComponent>(template, {
//                 items,
//                 scrollType: 'infinite',
//                 infiniteScrollDown: scrollDownSpy,
//                 infiniteScrollUp: () => {
//                     return
//                 },
//             })

//             const scrollEmitter = ngMocks.output(ngMocks.find('.grid-viewport'), 'scrolled')
//             scrollEmitter.emit()

//             expect(scrollDownSpy).toHaveBeenCalled()
//         })

//         it('should emit "infiniteScrollUp" when scroll reach top of the grid', () => {
//             const scrollUpSpy = jest.fn()
//             MockRender<GridTableListComponent>(template, {
//                 items,
//                 scrollType: 'infinite',
//                 infiniteScrollDown: () => {
//                     return
//                 },
//                 infiniteScrollUp: scrollUpSpy,
//             })

//             const scrollEmitter = ngMocks.output(ngMocks.find('.grid-viewport'), 'scrolledUp')
//             scrollEmitter.emit()

//             expect(scrollUpSpy).toHaveBeenCalled()
//         })
//     })
// })
