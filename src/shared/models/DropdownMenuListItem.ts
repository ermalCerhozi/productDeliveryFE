export interface DropdownMenuListItem {
    label: string
    tabs?: string[]
    icon?: string
    disabled?: boolean
    condition?: () => boolean
}
export interface DropdownMenuListActions {
    onDropdownMenuClick(item: DropdownEvent): void
}
export interface DropdownEvent {
    option: DropdownMenuListItem
    event: MouseEvent
}
