import { Component, inject, input, output, effect, signal, viewChild, AfterViewInit } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslocoService } from '@jsverse/transloco';

import { TABLE_DEPENDENCIES } from './table.component.dependencies';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TABLE_DEPENDENCIES],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T extends { id: number }> implements AfterViewInit {
  private translocoService = inject(TranslocoService);

  public data = input<T[] | null>([]);
  public columns = input<{ key: string; label: string }[]>();
  public searchQuery = input<string>('');
  public isSelectable = input<boolean>(true);
  public isEditable = input<boolean>(true);
  public isDeletable = input<boolean>(true);
  public showActions = input<boolean>(true);

  public selectedRows = output<T[]>();
  public currentPageInfo = output<{ currentPage: number; pageSize: number }>();
  public onEdit = output<T>();
  public onDelete = output<T>();

  public selectedRowsState = signal<T[]>([]);
  public dataSource = signal(new MatTableDataSource<T>([]));

  public paginator = viewChild<MatPaginator>(MatPaginator);
  public sort = viewChild<MatSort>(MatSort);

  constructor() {
    effect(() => {
      this.dataSource().data = this.data() || [];
      this.dataSource().paginator = this.paginator() || null;
      this.dataSource().sort = this.sort() || null;
      this.applyFilter();
    });

    effect(() => {
      this.selectedRows.emit(this.selectedRowsState());
    });
  }

  ngAfterViewInit(): void {
    if (this.paginator()) {
      this.translocoService.selectTranslate('table.itemsPerPageLabel').subscribe(value => {
        this.paginator()!._intl.itemsPerPageLabel = value;
        this.paginator()!._intl.changes.next();
      });
      this.paginator()!._intl.changes.next();
    }
  }

  get displayedColumns() {
    let baseColumns = this.columns()?.map(col => col.key) || [];
    const columnsToAdd = [];
    
    if (this.isSelectable() || this.isEditable()) {
      columnsToAdd.push('select');
    }
    
    if (this.showActions()) {
      return [...columnsToAdd, ...baseColumns, 'actions'];
    }
    
    return [...columnsToAdd, ...baseColumns];
  }

  private applyFilter(): void {
    const filterValue = this.searchQuery()?.trim().toLowerCase() || '';
    this.dataSource().filter = filterValue;
  }

  public onPageChange(event: PageEvent): void {
    this.currentPageInfo.emit({
      currentPage: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  public onToggleSelection(row: T): void {
    const currentSelection = [...this.selectedRowsState()];
    const index = currentSelection.findIndex(selectedRow => selectedRow.id === row.id);

    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(row);
    }

    this.selectedRowsState.set(currentSelection);
  }

  public onToggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedRowsState.set([...this.dataSource().filteredData]);
    } else {
      this.selectedRowsState.set([]);
    }
  }

  public clearSelection(): void {
    this.selectedRowsState.set([]);
  }

  public onAction(action: 'edit' | 'delete', item: T): void {
    if (action === 'edit') {
      this.onEdit.emit(item);
    } else {
      this.onDelete.emit(item);
    }
  }
}
