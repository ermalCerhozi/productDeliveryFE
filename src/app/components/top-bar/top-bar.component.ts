import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Subject, debounceTime, takeUntil } from 'rxjs'
import { SearchOptions } from 'src/shared/models/navigation-context.model'

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TopBarComponent implements OnInit, OnDestroy {
  searchQuery = new FormControl('')
  onDestroy = new Subject<void>()
  @Input() title = ''
  @Input() mediaCount = 0
  @Input() placeholder = ''
  @Input() searchOptions: SearchOptions = { title: true, all: true }
  @Input() disableAddItem = false
  @Output() searchQueryChange = new EventEmitter<string>()
  @Output() searchOptionsChange = new EventEmitter<SearchOptions>()
  @Output() addItem = new EventEmitter<void>()

  ngOnInit(): void {
      this.searchQuery.valueChanges
          .pipe(debounceTime(800), takeUntil(this.onDestroy))
          .subscribe((value) => {
              if (!value) {
                  value = ''
              }
              this.searchQueryChange.emit(value)
          })
  }

  ngOnDestroy(): void {
      this.onDestroy.next()
      this.onDestroy.complete()
  }

  clearSearchQuery() {
      this.searchQuery.setValue('')
  }

  changeSearchOptions() {
      this.searchOptionsChange.emit(this.searchOptions)
  }

  openUploadPanel() {
      this.addItem.emit()
  }
}
