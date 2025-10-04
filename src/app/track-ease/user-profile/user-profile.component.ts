import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import { NgIf, DatePipe } from '@angular/common'

import { Subscription } from 'rxjs'
import { finalize } from 'rxjs/operators'
import { cloneDeep, isEqual } from 'lodash-es'
import { MatButton, MatIconButton } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { MatToolbar } from '@angular/material/toolbar'

import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { UserEntity } from 'src/app/shared/models/user.model'
import { ChangePasswordComponent } from 'src/app/track-ease/change-password/change-password.component'
import { ImageResponse } from 'src/app/shared/models/image.model'

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    standalone: true,
    imports: [
        MatButton,
        MatIcon,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        NgIf,
        MatIconButton,
        MatSuffix,
        MatToolbar,
        DatePipe,
    ],
})
export class UserProfileComponent implements OnInit, OnDestroy {
    @ViewChild('fileInput') fileInput!: ElementRef
    profileForm!: FormGroup
    loggedInUser: UserEntity = {} as UserEntity
    initialFormValues!: any
    url = ''
    private profileRefreshSub?: Subscription

    constructor(
        private bakeryManagementService: BakeryManagementService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
    const cachedUser = this.bakeryManagementService.getLoggedInUser() as UserEntity | null

        if (!cachedUser?.id) {
            console.error('Unable to load user profile: missing cached user data.')
            this.loggedInUser = {
                id: 0,
                created_at: '',
                updated_at: '',
                first_name: '',
                last_name: '',
                nickname: '',
                phone_number: '',
                role: '',
                email: '',
                location: '',
                profile_picture: '',
            }
            this.initializeFormWithDefaultValues()
            this.initialFormValues = cloneDeep(this.profileForm.value)
            return
        }

        this.loggedInUser = cachedUser
        this.url = cachedUser.profile_picture ?? ''
        this.initializeFormWithDefaultValues()
        this.initialFormValues = cloneDeep(this.profileForm.value)

        this.profileRefreshSub = this.bakeryManagementService
            .fetchUserById(cachedUser.id, true)
            .subscribe({
                next: (user) => {
                    this.loggedInUser = user
                    this.url = user.profile_picture ?? ''
                    this.profileForm.patchValue({
                        id: user.id,
                        email: user.email,
                        phone_number: user.phone_number,
                        location: user.location ?? '',
                    })
                    this.initialFormValues = cloneDeep(this.profileForm.value)
                    this.profileForm.markAsPristine()
                    this.profileForm.markAsUntouched()
                },
                error: (error) => {
                    console.error('Failed to refresh user profile from API', error)
                },
            })
    }

    ngOnDestroy(): void {
        this.profileRefreshSub?.unsubscribe()
    }

    initializeFormWithDefaultValues() {
        const phoneRegex = /^[0-9]{10}$/ //TODO: Add a more complex regex to validate phone numbers, forr login as well

        this.profileForm = this.formBuilder.group({
            id: [this.loggedInUser.id], // Hidden input, used to send the user id to the server. A user can't change his id
            email: [this.loggedInUser.email, Validators.required],
            phone_number: [
                this.loggedInUser.phone_number,
                [Validators.required, Validators.pattern(phoneRegex)],
            ],
            location: [this.loggedInUser.location ?? ''],
        })
    }

    openUploadPanel() {
        this.fileInput.nativeElement.click() // Trigger the click event of the hidden file input element
    }

    onFileSelected(event: any) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0]
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result as string
                const base64 = result?.split(',')[1]

                if (!base64) {
                    console.error('Invalid image payload: unable to extract base64 data')
                    return
                }

                this.bakeryManagementService
                    .uploadImage({
                        fileName: file.name,
                        contentType: file.type || 'application/octet-stream',
                        data: base64,
                        userId: this.loggedInUser.id,
                    })
                    .pipe(
                        finalize(() => {
                            if (this.fileInput?.nativeElement) {
                                this.fileInput.nativeElement.value = ''
                            }
                        })
                    )
                    .subscribe({
                        next: (image: ImageResponse | null) => {
                            if (!image) {
                                console.warn('Image upload succeeded but no image payload was returned.')
                                return
                            }

                            if (!image.contentType || !image.data) {
                                console.error('Received malformed image payload from API')
                                return
                            }

                            const dataUri = `data:${image.contentType};base64,${image.data}`
                            this.loggedInUser.profile_picture = dataUri
                            this.url = dataUri
                        },
                        error: (error) => {
                            console.error('Failed to upload user image', error)
                        },
                    })
            }
            reader.readAsDataURL(file)
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

    openChangePasswordDialog(): void {
        const dealogRef = this.dialog.open(ChangePasswordComponent, {
            width: '400px',
        })

        dealogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.bakeryManagementService.changeUserPassword(this.loggedInUser.id, result)
            }
        })
    }

    isFormChanged() {
        return !isEqual(this.profileForm.value, this.initialFormValues)
    }

    cancelEdition() {
        this.profileForm.setValue(cloneDeep(this.initialFormValues))
    }

    updateUser() {
        this.bakeryManagementService.updateUser(this.profileForm.value, true)
        this.initialFormValues = cloneDeep(this.profileForm.value)
    }
}
