import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
    selector: 'app-products-table-list',
    templateUrl: './products-table-list.component.html',
    styleUrls: ['./products-table-list.component.scss'],
})
export class ProductsTableListComponent {
    @Input() item!: any
    // @Input() activeTab = ActiveTab.MediaLibrary.valueOf()
    @Output() editItem: EventEmitter<any> = new EventEmitter<any>()
    @Output() deleteItem: EventEmitter<any> = new EventEmitter<any>()
    // workspacePermission = WorkspacePermission

    dropdownMenuList = [
        {
            label: 'Edit',
            icon: 'remove_red_eye',
            // tabs: [ActiveTab.MediaLibrary.valueOf(), ActiveTab.TrashBin.valueOf()],
        },
        {
            label: 'Delete',
            icon: 'delete',
            // tabs: [ActiveTab.MediaLibrary.valueOf()],
            // permission: WorkspacePermission.UpdateMediaInMediaLibrary,
        },
    ] as any[]

    // filterDropdownMenuList(dropdownMenuListItems: DropdownMenuListItem[], activeTab: string) {
    //     return dropdownMenuListItems.filter((item) => {
    //         return (
    //             item.tabs.includes(activeTab) && (item.condition === undefined || item.condition())
    //         )
    //     })
    // }

    onDropdownMenuClick(menuItem: any, event: MouseEvent) {
        switch (menuItem.label) {
            case 'Edit':
                this.editItem.emit(this.item)
                break
            case 'Delete':
                this.deleteItem.emit(this.item)
                break
            default:
                event.stopPropagation()
        }
    }
}
