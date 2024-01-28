import { Component, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core'
import { MatMenu } from '@angular/material/menu'
import { DropdownMenuListItem, DropdownEvent } from 'src/shared/models/DropdownMenuListItem'

@Component({
    selector: 'app-dropdown-menu-list',
    templateUrl: './dropdown-menu-list.component.html',
    styleUrls: ['./dropdown-menu-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DropdownMenuListComponent {
    @Input() width = '230px'
    @ViewChild('menu') menu: MatMenu | null = null
    @Input() options: DropdownMenuListItem[] = []
    @Output() menuClick = new EventEmitter<DropdownEvent>()

    onDropdownMenuClick(option: DropdownMenuListItem, event: MouseEvent) {
        this.menuClick.emit({ option, event })
    }
}
