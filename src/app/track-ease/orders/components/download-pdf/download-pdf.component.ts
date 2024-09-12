import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatCheckboxModule } from '@angular/material/checkbox'
import {
    MatNativeDateModule,
    provideNativeDateAdapter,
    MAT_DATE_FORMATS,
    DateAdapter,
    MatOptionModule,
} from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common'
import { debounceTime, fromEvent, Observable, Subscription } from 'rxjs'
import { FilterOption } from 'src/app/shared/models/filter-option.model'
import { SearchService } from 'src/app/services/search.service'
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'

//TODO: fix expression changed after it has been checked error and removeredundancy, this file implements a lot of funcitons already in create and update component
@Component({
    selector: 'app-download-pdf',
    templateUrl: './download-pdf.component.html',
    styleUrls: ['./download-pdf.component.css'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatMenuModule,
        MatCheckboxModule,
        MatIconModule,
        MatNativeDateModule,
        MatButtonModule,
        MatInputModule,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOptionModule,
        AsyncPipe,
        NgIf,
        NgFor,
        MatDialogModule,
    ],
    providers: [provideNativeDateAdapter(), DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadPdfComponent implements OnInit {
    bakeryManagementService = inject(BakeryManagementService)
    datePipe = inject(DatePipe)
    searchService = inject(SearchService)
    dialogRef = inject(MatDialogRef<DownloadPdfComponent>)

    clients: Observable<FilterOption[]>
    hasMoreClientsToLoad: Observable<boolean>

    private scrollSubscription!: Subscription

    range = new FormGroup({
        startDate: new FormControl<string | null>(null),
        endDate: new FormControl<string | null>(null),
        client: new FormControl<any>(null),
    })

    constructor() {
        this.clients = this.searchService.getClients()
        this.hasMoreClientsToLoad = this.searchService.getHasMoreClientsToLoad()
    }

    ngOnInit() {
        this.loadMoreClients()
    }

    // This function is triggered when the autocomplete panel is scrolled.
    // It checks if the end of the panel is reached by comparing the scroll position with the total scroll height.
    // If the end is reached and there are more clients to load (hasMoreClientsToLoad is true),
    // it calls the loadMoreClients() function to load more clients.
    onScroll(event: any) {
        if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
            this.loadMoreClients()
        }
    }

    // This function is triggered when the autocomplete panel is opened.
    // It creates a subscription to the scroll event of the autocomplete panel.
    // The debounceTime(200) is used to limit the number of events triggered.
    onOpened(autoComplete: MatAutocomplete) {
        setTimeout(() => {
            if (autoComplete && autoComplete.panel) {
                if (autoComplete.panel) {
                    this.scrollSubscription = fromEvent(autoComplete.panel.nativeElement, 'scroll')
                        .pipe(debounceTime(200))
                        .subscribe((e) => this.onScroll(e))
                } else {
                    console.error('autoComplete.panel is still undefined')
                }
            }
        }, 0)
    }

    // This function is triggered when the autocomplete panel is closed.
    // It checks if there is a subscription to the scroll event and if so, it unsubscribes from it.
    // This is done to prevent memory leaks.
    onClosed() {
        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe()
        }
    }

    displayFn(option: any): string {
        if (!option) {
            return ''
        }
        return option.label
    }

    clientSearchChange(event: any) {
        const inputValue = (event.target as HTMLInputElement).value
        this.searchService.clientSearchChange(inputValue)
    }
    loadMoreClients() {
        this.searchService.loadMoreClients()
    }

    save() {
        const formValue = {
            startDate: '',
            endDate: '',
            client: '',
        }

        formValue.startDate =
            this.datePipe.transform(this.range.get('startDate')?.value, 'dd/MM/yyyy') || ''
        formValue.endDate =
            this.datePipe.transform(this.range.get('endDate')?.value, 'dd/MM/yyyy') || ''

        const client: FilterOption | null = this.range.get('client')?.value || null
        formValue.client = client ? client.value.toString() : ''

        this.bakeryManagementService.downloadOrdersPdf(formValue)
        this.dialogRef.close()
    }
}
