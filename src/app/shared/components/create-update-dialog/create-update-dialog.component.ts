import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ProductEntity } from 'src/app/shared/models/product.model'
import { UserEntity } from 'src/app/shared/models/user.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { Subject } from 'rxjs'
import { cloneDeep, isEqual } from 'lodash'
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        NgSwitch,
        NgSwitchCase,
        CdkScrollable,
        MatDialogContent,
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
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class CreateUpdateDialogComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>()
    form: FormGroup = new FormGroup({})
    initialFormValues: any //Any because the form can be a UserEntity or ProductEntity

    // @Input
    @Input() type!: string //UserEntity | ProductEntity
    @Input() action!: string //Create | Update
    @Input() product?: ProductEntity //Product to be updated
    @Input() user?: UserEntity //User to be updated
    // @Output
    @Output() updateProduct = new EventEmitter<ProductEntity>()
    @Output() createProduct = new EventEmitter()
    @Output() createUser = new EventEmitter()
    @Output() updateUser = new EventEmitter<UserEntity>()

    constructor(public bakeryManagementService: BakeryManagementService, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.initializeForm()
        this.initialFormValues = cloneDeep(this.form.value)
    }

    initializeForm(): void {
        let formData

        if (this.type === 'user') {
            formData =
                this.action === 'update' && this.user
                    ? {
                          ...this.user,
                          role: this.user.role.toLowerCase(),
                      }
                    : {
                          first_name: '',
                          last_name: '',
                          nickname: '',
                          email: '',
                          phone_number: '',
                          role: '',
                          location: '',
                      }

            this.form = this.fb.group({
                first_name: [formData.first_name, Validators.required],
                last_name: [formData.last_name, Validators.required],
                nickname: [formData.nickname],
                email: [formData.email],
                phone_number: [
                    formData.phone_number,
                    [Validators.required, Validators.minLength(10)],
                ],
                role: [formData.role, Validators.required],
                location: [formData.location],
            })
        } else if (this.type === 'product') {
            formData =
                this.action === 'update' && this.product
                    ? this.product
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
            if (this.type === 'product') {
                const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                const productName = capitalize(this.form.value.product_name)
                this.form.patchValue({ product_name: productName })

                if (this.action === 'create') {
                    this.createProduct.emit(this.form.value)
                } else if (this.action === 'update') {
                    this.updateProduct.emit(this.form.value)
                }
            } else if (this.type === 'user') {
                const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                const firstName = capitalize(this.form.value.first_name)
                const lastName = capitalize(this.form.value.last_name)
                this.form.patchValue({ first_name: firstName, last_name: lastName })

                if (this.action === 'create') {
                    this.createUser.emit(this.form.value)
                } else if (this.action === 'update') {
                    this.updateUser.emit(this.form.value)
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
}
