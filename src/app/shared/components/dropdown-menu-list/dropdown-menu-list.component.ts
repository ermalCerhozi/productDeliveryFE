import { Component, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core'
import { MatMenu, MatMenuItem } from '@angular/material/menu'
import { DropdownMenuListItem, DropdownEvent } from 'src/app/shared/models/DropdownMenuListItem'
import { NgFor, NgStyle } from '@angular/common'
import { MatIcon } from '@angular/material/icon'

@Component({
    selector: 'app-dropdown-menu-list',
    templateUrl: './dropdown-menu-list.component.html',
    styleUrls: ['./dropdown-menu-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatMenu, NgFor, MatMenuItem, NgStyle, MatIcon],
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
