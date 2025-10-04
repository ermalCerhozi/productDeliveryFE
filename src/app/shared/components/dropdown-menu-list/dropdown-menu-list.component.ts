import { Component, input, output, ViewChild, ViewEncapsulation } from '@angular/core'
import { NgFor, NgStyle } from '@angular/common'

import { MatIcon } from '@angular/material/icon'
import { MatMenu, MatMenuItem } from '@angular/material/menu'

import { DropdownMenuListItem, DropdownEvent } from 'src/app/shared/models/DropdownMenuListItem'

@Component({
    selector: 'app-dropdown-menu-list',
    templateUrl: './dropdown-menu-list.component.html',
    styleUrls: ['./dropdown-menu-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatMenu, NgFor, MatMenuItem, NgStyle, MatIcon],
})
export class DropdownMenuListComponent {
    width = input('230px')
    @ViewChild('menu') menu: MatMenu | null = null
    options = input<DropdownMenuListItem[]>([])
    menuClick = output<DropdownEvent>()

    onDropdownMenuClick(option: DropdownMenuListItem, event: MouseEvent) {
        this.menuClick.emit({ option, event })
    }
}
