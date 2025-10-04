import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { UserEntity } from 'src/app/shared/models/user.model'
import {
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog'
import { NgIf } from '@angular/common'
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field'
import { MatInput } from '@angular/material/input'
import { MatSelect } from '@angular/material/select'
import { MatOption } from '@angular/material/core'
import { MatIconButton, MatButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { cloneDeep, isEqual } from 'lodash-es'

@Component({
    selector: 'app-create-update-user-dialog',
    templateUrl: './create-update-user-dialog.component.html',
    styleUrls: ['./create-update-user-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        NgIf,
        MatError,
        MatSelect,
        MatOption,
        MatIconButton,
        MatSuffix,
        MatIcon,
        MatButton,
        MatDialogClose,
    ],
})
export class CreateUpdateUserDialogComponent implements OnInit {
    @Input() action!: 'create' | 'update'
    @Input() user?: UserEntity

    @Output() createUser = new EventEmitter<UserEntity>()
    @Output() updateUser = new EventEmitter<UserEntity>()

    form: FormGroup = new FormGroup({})
    private initialFormValues: unknown

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = cloneDeep(this.form.value)
    }

    initializeForm(): void {
        const formData =
            this.action === 'update' && this.user
                ? {
                      ...this.user,
                      role: this.user.role?.toLowerCase?.() ?? this.user.role,
                      phone_prefix: this.extractPhonePrefix(this.user.phone_number),
                      phone_number: this.extractPhoneNumber(this.user.phone_number),
                  }
                : {
                      first_name: '',
                      last_name: '',
                      nickname: '',
                      email: '',
                      phone_prefix: '+355',
                      phone_number: '',
                      role: '',
                      location: '',
                  }

        this.form = this.fb.group({
            first_name: [formData.first_name, Validators.required],
            last_name: [formData.last_name, Validators.required],
            nickname: [formData.nickname],
            email: [formData.email],
            phone_prefix: [formData.phone_prefix, Validators.required],
            phone_number: [
                formData.phone_number,
                [Validators.required, Validators.pattern('^[0-9]{7,12}$')],
            ],
            role: [formData.role, Validators.required],
            location: [formData.location],
        })
    }

    formHasChanged(): boolean {
        return !isEqual(this.initialFormValues, this.form.value)
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched()
            return
        }

        const capitalize = (value: string) =>
            value ? value.charAt(0).toUpperCase() + value.slice(1) : value
        const firstName = capitalize(this.form.value.first_name)
        const lastName = capitalize(this.form.value.last_name)
        this.form.patchValue({ first_name: firstName, last_name: lastName })

        const { phone_prefix, ...rest } = this.form.value
        const userValue = {
            ...rest,
            phone_number: `${phone_prefix}${this.form.value.phone_number}`,
        }

        if (this.action === 'create') {
            this.createUser.emit(userValue)
        } else {
            this.updateUser.emit(userValue)
        }
    }

    openInNewWindow(value: string) {
        const newWindow = window.open(value, '_blank')
        if (newWindow) {
            newWindow.opener = null
        } else {
            console.error(
                'Unable to open link in a new window. Please check your browser settings.'
            )
        }
    }

    private extractPhonePrefix(fullNumber?: string): string {
        if (!fullNumber) return '+355'
        if (fullNumber.startsWith('+39')) return '+39'
        if (fullNumber.startsWith('+49')) return '+49'
        if (fullNumber.startsWith('+33')) return '+33'
        if (fullNumber.startsWith('+34')) return '+34'
        if (fullNumber.startsWith('+44')) return '+44'
        return '+355'
    }

    private extractPhoneNumber(fullNumber?: string): string {
        if (!fullNumber) return ''
        return fullNumber.replace(/^\+(355|39|49|33|34|44)/, '')
    }
}
