import { Component, output, input } from "@angular/core";

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.scss'],
})
export class TableActionsComponent {
  public isAddEnabled = input<boolean>(false);
  public isDeleteEnabled = input<boolean>(false);
  public isExportEnabled = input<boolean>(false);
  public selectedCount = input<number>(0);
  public add = output<void>();
  public deleteSelected = output<void>();
  public exportSelected = output<void>();

  public onAddElement(): void {
    this.add.emit();
  }

  public onDeleteSelectedElement(): void {
    this.deleteSelected.emit();
  }

  public onExportSelectedElement(): void {
    this.exportSelected.emit();
  }
}
