import { Component, OnInit, output, inject, DestroyRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-table-search',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, TranslocoDirective],
  templateUrl: './table-search.component.html'
})
export class TableSearchComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  public search = output<string>();
  private searchChanged = new Subject<string>();

  ngOnInit(): void {
    this.searchChanged
      .pipe(debounceTime(400))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.search.emit(value));
  }

  public onSearch(value: string): void {
    this.searchChanged.next(value);
  }
}
