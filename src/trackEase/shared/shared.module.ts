import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSliderModule } from '@angular/material/slider'

// TODO: Implement translation service
// import { I18NextModule } from 'ngx-i18next'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { GridTableListComponent } from 'src/trackEase/shared/components/grid-table-list/grid-table-list.component'
import { TopBarComponent } from 'src/trackEase/shared/components/top-bar/top-bar.component'
import { DropdownMenuListComponent } from 'src/trackEase/shared/components/dropdown-menu-list/dropdown-menu-list.component'
import { CreateUpdateDialogComponent } from 'src/trackEase/shared/components/create-update-dialog/create-update-dialog.component'
import { ConfirmationDialogComponent } from 'src/trackEase/shared/components/confirmation-dialog/confirmation-dialog.component'
import { PasswordStrengthComponent } from 'src/trackEase/shared/components/password-strength/password-strength.component'
import { ExternalUrlSanitizerPipe } from 'src/trackEase/shared/common/pipes/external-url-sanitizer.pipe'

@NgModule({
    declarations: [
        GridTableListComponent,
        TopBarComponent,
        DropdownMenuListComponent,
        CreateUpdateDialogComponent,
        ConfirmationDialogComponent,
        PasswordStrengthComponent,
        ExternalUrlSanitizerPipe,
    ],
    imports: [
        CommonModule,
        // I18NextModule,
        InfiniteScrollModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatDividerModule,
        MatButtonModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        ScrollingModule,
        FormsModule,
        MatSelectModule,
        MatChipsModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatMenuModule,
        MatInputModule,
        MatRadioModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatSliderModule,
    ],
    exports: [
        InfiniteScrollModule,
        GridTableListComponent,
        TopBarComponent,
        DropdownMenuListComponent,
        CreateUpdateDialogComponent,
        ConfirmationDialogComponent,
        PasswordStrengthComponent,
        ExternalUrlSanitizerPipe,
    ],
    providers: [],
})
export class SharedModule {}
