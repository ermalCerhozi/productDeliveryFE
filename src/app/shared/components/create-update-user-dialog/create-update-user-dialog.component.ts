import {
    Component,
    ElementRef,
    inject,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'

import { finalize, map, of, switchMap, take, throwError } from 'rxjs'
import { cloneDeep, isEqual } from 'lodash-es'
import { MatIconButton, MatButton } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import {
    MatDialog,
    MAT_DIALOG_DATA,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog'
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { MatSelect } from '@angular/material/select'

import { CreateUserResponse, UserEntity } from 'src/app/shared/models/user.model'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { ImageResponse } from '../../models/image.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { TranslocoDirective } from '@jsverse/transloco'

type UserFormValue = {
    first_name: string
    last_name: string
    nickname: string
    email: string
    phone_prefix: string
    phone_number: string
    role: string
    location: string
}

@Component({
    selector: 'app-create-update-user-dialog',
    templateUrl: './create-update-user-dialog.component.html',
    styleUrls: ['./create-update-user-dialog.component.scss'],
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
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
        MatButton,
        MatDialogClose,
        MatProgressSpinner,
        TranslocoDirective,
    ],
})
export class CreateUpdateUserDialogComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>

    action: 'create' | 'update' = 'create'
    readonly defaultAvatar = '/assets/images/avatar.png'
    form!: FormGroup
    previewImageUrl: string | null = null
    isSubmitting = false
    isLoadingUserDetails = false

    private currentUser: UserEntity | null = null
    private initialFormValues: UserFormValue | null = null
    private selectedImagePayload?: {
        fileName: string
        contentType: string
        data: string
    }
    private loadedUserId?: number

    private fb = inject(FormBuilder)
    private bakeryManagementApiService = inject(BakeryManagementApiService)
    private bakeryManagementService = inject(BakeryManagementService)
    private dialog = inject(MatDialog)

    constructor(@Inject(MAT_DIALOG_DATA) public data: { user?: UserEntity }) {
        // Initialize form in constructor to ensure it's ready before template renders
        this.currentUser = this.data?.user || null
        this.syncActionState()
        this.initializeForm()
    }

    ngOnInit(): void {
        this.rebuildFormStateFromCurrentContext({ skipFetch: false })
    }

    private rebuildFormStateFromCurrentContext(options?: { skipFetch?: boolean }): void {
        this.syncActionState()

        if (!options?.skipFetch && this.shouldFetchUserDetails()) {
            this.fetchUserDetails(this.currentUser!.id)
            return
        }

        this.captureInitialFormValues()
        this.updatePreviewImage()
    }

    private syncActionState(): void {
        this.action = this.currentUser ? 'update' : 'create'
    }

    private shouldFetchUserDetails(): boolean {
        return (
            !!this.currentUser?.id &&
            !this.isCreateMode &&
            this.currentUser.id !== this.loadedUserId
        )
    }

    private fetchUserDetails(userId: number): void {
        if (this.isLoadingUserDetails) {
            return
        }

        this.isLoadingUserDetails = true

        this.bakeryManagementApiService
            .getUser(userId)
            .pipe(
                finalize(() => {
                    this.isLoadingUserDetails = false
                })
            )
            .subscribe({
                next: (user) => {
                    this.currentUser = user
                    this.loadedUserId = user.id
                    this.clearSelectedImage()
                    
                    // Update form values instead of reinitializing
                    const formData = this.createFormValueFromContext(user)
                    this.form.patchValue(formData)
                    this.captureInitialFormValues()
                    this.updatePreviewImage()
                },
                error: (error) => {
                    this.loadedUserId = userId
                    console.error('Failed to load user details', error)
                    this.rebuildFormStateFromCurrentContext({ skipFetch: true })
                },
            })
    }

    private get isCreateMode(): boolean {
        return this.action === 'create'
    }

    initializeForm(): void {
        const formData = this.createFormValueFromContext(this.currentUser)

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

    private normalizeRoleInput(role: UserEntity['role']): string {
        if (!role) {
            return ''
        }

        if (typeof role === 'string') {
            return role.toLowerCase()
        }

        const maybeRoleObject = role as unknown as { name?: string }
        if (typeof maybeRoleObject?.name === 'string') {
            return maybeRoleObject.name.toLowerCase()
        }

        return ''
    }

    formHasChanged(): boolean {
        if (!this.initialFormValues) {
            return !!this.selectedImagePayload
        }

        return !isEqual(this.initialFormValues, this.form.value) || !!this.selectedImagePayload
    }

    get imageButtonLabel(): string {
        return this.previewImageUrl ? 'Change Image' : 'Add Image'
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting || this.isLoadingUserDetails) {
            if (this.form.invalid) {
                this.form.markAllAsTouched()
            }
            return
        }

        const formValue = this.form.getRawValue() as UserFormValue
        const formattedFormValue = this.withCapitalizedNames(formValue)

        this.form.patchValue(
            {
                first_name: formattedFormValue.first_name,
                last_name: formattedFormValue.last_name,
            },
            { emitEvent: false }
        )

        const userValue = this.buildUserPayload(formattedFormValue)

        this.isSubmitting = true

        this.performUserMutation(userValue)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false
                })
            )
            .subscribe({
                next: (user) => this.onSuccessfulSubmission(user),
                error: (error) => {
                    console.error(
                        this.isCreateMode ? 'Failed to create user' : 'Failed to update user',
                        error
                    )
                },
            })
    }

    openInNewWindow(value?: string): void {
        if (!value) {
            return
        }

        const newWindow = window.open(value, '_blank')
        if (newWindow) {
            newWindow.opener = null
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

    private clearSelectedImage(): void {
        this.selectedImagePayload = undefined
        this.resetFileInput()
    }

    private resetFileInput(): void {
        if (this.fileInput?.nativeElement) {
            this.fileInput.nativeElement.value = ''
        }
    }

    openUploadPanel() {
        if (this.isSubmitting || this.isLoadingUserDetails || !this.fileInput?.nativeElement) {
            return
        }

        this.fileInput.nativeElement.click()
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement
        if (!input.files || !input.files.length) {
            return
        }

        const file = input.files[0]
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            const base64 = result?.split(',')[1]

            if (!base64) {
                console.error('Invalid image payload: unable to extract base64 data')
                return
            }

            this.selectedImagePayload = {
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
                data: base64,
            }

            this.updatePreviewImage()
        }

        reader.readAsDataURL(file)
    }

    private updatePreviewImage(): void {
        this.previewImageUrl = this.derivePreviewImage()
    }

    private buildSelectedImageDataUri(): string | null {
        if (!this.selectedImagePayload) {
            return null
        }

        return `data:${this.selectedImagePayload.contentType};base64,${this.selectedImagePayload.data}`
    }

    private buildDataUri(image: ImageResponse | null): string | null {
        if (!image?.contentType || !image?.data) {
            return null
        }

        return `data:${image.contentType};base64,${image.data}`
    }

    private refreshUsersListAndCloseDialog(): void {
        this.bakeryManagementService
            .updateUsersList(false)
            .pipe(take(1))
            .subscribe({
                next: () => this.dialog.closeAll(),
                error: (error) => {
                    console.error('Failed to refresh users list', error)
                    this.dialog.closeAll()
                },
            })
    }

    private captureInitialFormValues(): void {
        this.initialFormValues = cloneDeep(this.form.getRawValue()) as UserFormValue
    }

    private createFormValueFromContext(user?: UserEntity | null): UserFormValue {
        if (!user || this.isCreateMode) {
            return {
                first_name: '',
                last_name: '',
                nickname: '',
                email: '',
                phone_prefix: '+355',
                phone_number: '',
                role: '',
                location: '',
            }
        }

        return {
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            nickname: user.nickname ?? '',
            email: user.email ?? '',
            phone_prefix: this.extractPhonePrefix(user.phone_number),
            phone_number: this.extractPhoneNumber(user.phone_number),
            role: this.normalizeRoleInput(user.role),
            location: user.location ?? '',
        }
    }

    private withCapitalizedNames(formValue: UserFormValue): UserFormValue {
        const capitalize = (value: string) =>
            value ? value.charAt(0).toUpperCase() + value.slice(1) : value

        return {
            ...formValue,
            first_name: capitalize(formValue.first_name),
            last_name: capitalize(formValue.last_name),
        }
    }

    private buildUserPayload(formValue: UserFormValue): Partial<UserEntity> {
        const { phone_prefix, phone_number, ...rest } = formValue

        return {
            ...rest,
            phone_number: `${phone_prefix}${phone_number}`,
        }
    }

    private performUserMutation(userValue: Partial<UserEntity>) {
        if (this.isCreateMode) {
            return this.bakeryManagementApiService.createUser(userValue).pipe(
                switchMap((response: CreateUserResponse) => {
                    if (!response?.id) {
                        throw new Error('The create user response did not include the new user id.')
                    }

                    if (!response?.user) {
                        throw new Error(
                            'The create user response did not include the new user entity.'
                        )
                    }

                    return this.attachImageIfNeeded(response.id, response.user)
                })
            )
        }

        if (!this.currentUser) {
            return throwError(
                () => new Error('Cannot update user because no user context is available.')
            )
        }

        return this.bakeryManagementApiService
            .updateUser(this.currentUser, userValue)
            .pipe(switchMap((updatedUser) => this.attachImageIfNeeded(updatedUser.id, updatedUser)))
    }

    private attachImageIfNeeded(userId: number, baseUser: UserEntity) {
        if (!this.selectedImagePayload) {
            return of(baseUser)
        }

        return this.bakeryManagementService
            .uploadImage({
                ...this.selectedImagePayload,
                userId,
            })
            .pipe(
                map((image) => {
                    const dataUri = this.buildDataUri(image)
                    if (dataUri) {
                        baseUser.profile_picture = dataUri
                    }

                    return baseUser
                })
            )
    }

    private onSuccessfulSubmission(user: UserEntity): void {
        if (user) {
            this.currentUser = user
            this.loadedUserId = user.id
        }

        this.clearSelectedImage()
        this.updatePreviewImage()
        this.captureInitialFormValues()
        this.refreshUsersListAndCloseDialog()
    }

    private derivePreviewImage(): string | null {
        const selectedImageDataUri = this.buildSelectedImageDataUri()
        if (selectedImageDataUri) {
            return selectedImageDataUri
        }

        if (this.currentUser?.profile_picture) {
            return this.currentUser.profile_picture
        }

        const fallbackImage = this.currentUser?.images?.[0]
        if (fallbackImage?.contentType && fallbackImage?.data) {
            return `data:${fallbackImage.contentType};base64,${fallbackImage.data}`
        }

        return null
    }
}
