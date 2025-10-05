import { Component, input, output, OnDestroy, OnInit, inject } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'

import { Subject } from 'rxjs'
import { cloneDeep, isEqual } from 'lodash-es'
import { CdkScrollable } from '@angular/cdk/scrolling'
import { MatIconButton, MatButton } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import {
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog'
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { MatSelect } from '@angular/material/select'
import { TranslocoDirective } from '@jsverse/transloco'

import { ProductEntity } from 'src/app/shared/models/product.model'
import { UserEntity } from 'src/app/shared/models/user.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatSelect,
        MatOption,
        MatIconButton,
        MatSuffix,
        MatIcon,
        MatDialogActions,
        MatButton,
        MatDialogClose,
        TranslocoDirective,
    ],
})
export class CreateUpdateDialogComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>()
    form: FormGroup = new FormGroup({})
    initialFormValues: any //Any because the form can be a UserEntity or ProductEntity

    // Inputs
    type = input.required<string>() //UserEntity | ProductEntity
    action = input.required<string>() //Create | Update
    product = input<ProductEntity>() //Product to be updated
    user = input<UserEntity>() //User to be updated
    // Outputs
    updateProduct = output<ProductEntity>()
    createProduct = output()
    createUser = output()
    updateUser = output<UserEntity>()

    public bakeryManagementService = inject(BakeryManagementService)
    private fb = inject(FormBuilder)

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = cloneDeep(this.form.value)
    }

    initializeForm(): void {
        let formData

        if (this.type() === 'user') {
            formData =
                this.action() === 'update' && this.user()
                    ? {
                          ...this.user(),
                          role: this.user()!.role.toLowerCase(),
                          phone_prefix: this.extractPhonePrefix(this.user()!.phone_number),
                          phone_number: this.extractPhoneNumber(this.user()!.phone_number),
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
        } else if (this.type() === 'product') {
            formData =
                this.action() === 'update' && this.product()
                    ? this.product()!
                    : {
                          product_name: '',
                          price: '',
                          description: '',
                          image: '',
                          ingredients: '',
                      }

            this.form = this.fb.group({
                product_name: [formData.product_name, Validators.required],
                price: [formData.price, Validators.required],
                description: [formData.description],
                image: [formData.image],
                ingredients: [formData.ingredients],
            })
        }
    }

    formHasChanged(): boolean {
        return !isEqual(this.initialFormValues, this.form.value)
    }

    insertItem(): void {
        if (this.form.valid) {
            if (this.type() === 'product') {
                const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                const productName = capitalize(this.form.value.product_name)
                this.form.patchValue({ product_name: productName })

                if (this.action() === 'create') {
                    this.createProduct.emit(this.form.value)
                } else if (this.action() === 'update') {
                    this.updateProduct.emit(this.form.value)
                }
            } else if (this.type() === 'user') {
                const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                const firstName = capitalize(this.form.value.first_name)
                const lastName = capitalize(this.form.value.last_name)
                this.form.patchValue({ first_name: firstName, last_name: lastName })

                // Combine prefix and number for output, but do not send phone_prefix
                const { phone_prefix, ...rest } = this.form.value
                const userValue = {
                    ...rest,
                    phone_number: `${this.form.value.phone_prefix}${this.form.value.phone_number}`,
                }

                if (this.action() === 'create') {
                    this.createUser.emit(userValue)
                } else if (this.action() === 'update') {
                    this.updateUser.emit(userValue)
                }
            }
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

    ngOnDestroy(): void {
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
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
