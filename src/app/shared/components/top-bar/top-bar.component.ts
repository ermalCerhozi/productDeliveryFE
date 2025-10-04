import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'

import { Subject, debounceTime, takeUntil } from 'rxjs'
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete'
import { MatButton } from '@angular/material/button'
import { MatCheckbox } from '@angular/material/checkbox'
import { MatOption } from '@angular/material/core'
import { MatFormField, MatPrefix, MatLabel, MatSuffix } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'

import { SearchOptions } from 'src/app/shared/models/context-navigation.model'

// TODO: add sorting options
@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
    standalone: true,
    imports: [
        MatFormField,
        MatIcon,
        MatPrefix,
        MatLabel,
        MatInput,
        FormsModule,
        MatAutocompleteTrigger,
        ReactiveFormsModule,
        MatAutocomplete,
        MatCheckbox,
        MatOption,
        MatSuffix,
        NgIf,
        MatButton,
    ],
})
export class TopBarComponent implements OnInit, OnDestroy {
    searchQuery = new FormControl('')
    onDestroy = new Subject<void>()
    @Input() title = ''
    @Input() mediaCount = 0
    @Input() placeholder = ''
    @Input() searchOptions: SearchOptions = { title: true, all: true }
    @Input() disableAddItem = false
    @Input() displayAddButton = true
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

    changeSearchOptions(item: string) {
        switch (item) {
            case 'title':
                this.searchOptions.title = true
                this.searchOptions.all = false
                break
            case 'all':
                this.searchOptions.all = true
                this.searchOptions.title = false
                break
        }
        this.searchOptionsChange.emit(this.searchOptions)
    }

    openUploadPanel() {
        this.addItem.emit()
    }
}
