import { Component, input, OnDestroy, OnInit, output } from '@angular/core'
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
import { TranslocoDirective } from '@jsverse/transloco'

// TODO: add sorting options
@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
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
        TranslocoDirective
    ]
})
export class TopBarComponent implements OnInit, OnDestroy {
    title = input<string>('')
    mediaCount = input<number>(0)
    placeholder = input<string>('')
    searchOptions = input<SearchOptions>({ title: true, all: true })
    disableAddItem = input<boolean>(false)
    displayAddButton = input<boolean>(true)
    
    searchQueryChange = output<string>()
    searchOptionsChange = output<SearchOptions>()
    addItem = output<void>()

    searchQuery = new FormControl('')
    onDestroy = new Subject<void>()

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
        const newOptions: SearchOptions = { ...this.searchOptions() }
        switch (item) {
            case 'title':
                newOptions.title = true
                newOptions.all = false
                break
            case 'all':
                newOptions.all = true
                newOptions.title = false
                break
        }
        this.searchOptionsChange.emit(newOptions)
    }

    openUploadPanel() {
        this.addItem.emit()
    }
}
