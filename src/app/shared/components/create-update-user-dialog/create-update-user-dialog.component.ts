import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { CreateUserResponse, UserEntity } from 'src/app/shared/models/user.model'
import {
    MatDialog,
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
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { cloneDeep, isEqual } from 'lodash-es'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { finalize, forkJoin, map, of, switchMap, take } from 'rxjs'
import { ImageResponse } from '../../models/image.model'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'

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
        MatProgressSpinner,
    ],
})
export class CreateUpdateUserDialogComponent implements OnInit, OnChanges {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>
    @Input() user?: UserEntity | null

    action: 'create' | 'update' = 'create'
    readonly defaultAvatar = '/assets/images/avatar.png'
    form: FormGroup = new FormGroup({})
    previewImageUrl: string | null = null
    isSubmitting = false
    isLoadingUserDetails = false

    private initialFormValues: unknown
    private selectedImagePayload?: {
        fileName: string
        contentType: string
        data: string
    }
    private loadedUserId?: number

    constructor(
        private fb: FormBuilder,
        private bakeryManagementApiService: BakeryManagementApiService,
        private bakeryManagementService: BakeryManagementService,
        private dialog: MatDialog,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['user']) {
            this.loadedUserId = undefined
            this.rebuildFormStateFromCurrentContext()
        }
    }

    ngOnInit(): void {
        this.rebuildFormStateFromCurrentContext()
    }

    private rebuildFormStateFromCurrentContext(options?: { skipFetch?: boolean }): void {
        this.syncActionState()

        if (!options?.skipFetch && this.shouldFetchUserDetails()) {
            this.fetchUserDetails(this.user!.id)
            return
        }

        this.initializeForm()
        this.initialFormValues = cloneDeep(this.form.value)
        this.updatePreviewImage()
    }

    private syncActionState(): void {
        this.action = this.user ? 'update' : 'create'
    }

    private shouldFetchUserDetails(): boolean {
        return !!this.user?.id && !this.isCreateMode && this.user.id !== this.loadedUserId
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
                }),
            )
            .subscribe({
                next: (user) => {
                    this.user = user
                    this.loadedUserId = user.id
                    this.clearSelectedImage()
                    this.rebuildFormStateFromCurrentContext({ skipFetch: true })
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
        const isUpdate = !this.isCreateMode && !!this.user
        const formData = isUpdate && this.user
            ? {
                  first_name: this.user.first_name ?? '',
                  last_name: this.user.last_name ?? '',
                  nickname: this.user.nickname ?? '',
                  email: this.user.email ?? '',
                  phone_prefix: this.extractPhonePrefix(this.user.phone_number),
                  phone_number: this.extractPhoneNumber(this.user.phone_number),
                  role: this.normalizeRoleInput(this.user.role),
                  location: this.user.location ?? '',
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

        const capitalize = (value: string) =>
            value ? value.charAt(0).toUpperCase() + value.slice(1) : value
        const firstName = capitalize(this.form.value.first_name)
        const lastName = capitalize(this.form.value.last_name)

        this.form.patchValue(
            { first_name: firstName, last_name: lastName },
            { emitEvent: false },
        )

        const { phone_prefix, ...rest } = this.form.value
        const userValue: Partial<UserEntity> = {
            ...rest,
            phone_number: `${phone_prefix}${this.form.value.phone_number}`,
        }

        if (this.isCreateMode) {
            this.handleCreate(userValue)
        } else {
            this.handleUpdate(userValue)
        }
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

    private handleCreate(userValue: Partial<UserEntity>): void {
        this.isSubmitting = true

        this.bakeryManagementApiService
            .createUser(userValue)
            .pipe(
                switchMap((response: CreateUserResponse) => {
                    const createdUser = response.user
                    const createdUserId = response.id

                    if (!createdUserId) {
                        throw new Error('The create user response did not include the new user id.')
                    }

                    if (this.selectedImagePayload) {
                        return this.bakeryManagementService
                            .uploadImage({
                                ...this.selectedImagePayload,
                                userId: createdUserId,
                            })
                            .pipe(map((image) => ({ user: createdUser, image })))
                    }

                    return of({
                        user: createdUser,
                        image: null as ImageResponse | null,
                    })
                }),
                finalize(() => {
                    this.isSubmitting = false
                }),
            )
            .subscribe({
                next: ({ user, image }) => {
                    if (user && image) {
                        const dataUri = this.buildDataUri(image)
                        if (dataUri) {
                            user.profile_picture = dataUri
                        }
                    }

                    if (user) {
                        this.loadedUserId = user.id
                        this.user = user
                    }

                    this.clearSelectedImage()
                    this.refreshUsersListAndCloseDialog()
                },
                error: (error) => {
                    console.error('Failed to create user', error)
                },
            })
    }

    private handleUpdate(userValue: Partial<UserEntity>): void {
        if (!this.user) {
            console.error('Cannot update user because no user context is available.')
            return
        }

        this.isSubmitting = true

        const update$ = this.bakeryManagementApiService.updateUser(this.user, userValue)
        const image$ = this.selectedImagePayload
            ? this.bakeryManagementService.uploadImage({
                  ...this.selectedImagePayload,
                  userId: this.user.id,
              })
            : of(null as ImageResponse | null)

        forkJoin([update$, image$])
            .pipe(
                finalize(() => {
                    this.isSubmitting = false
                }),
            )
            .subscribe({
                next: ([updatedUser, image]) => {
                    if (image) {
                        const dataUri = this.buildDataUri(image)
                        if (dataUri) {
                            updatedUser.profile_picture = dataUri
                        }
                    }

                    this.loadedUserId = updatedUser.id
                    this.user = updatedUser
                    this.clearSelectedImage()
                    this.refreshUsersListAndCloseDialog()
                },
                error: (error) => {
                    console.error('Failed to update user', error)
                },
            })
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
        const selectedImageDataUri = this.buildSelectedImageDataUri()
        if (selectedImageDataUri) {
            this.previewImageUrl = selectedImageDataUri
            return
        }

        if (this.user?.profile_picture) {
            this.previewImageUrl = this.user.profile_picture
            return
        }

        const fallbackImage = this.user?.images?.[0]
        if (fallbackImage?.contentType && fallbackImage?.data) {
            this.previewImageUrl = `data:${fallbackImage.contentType};base64,${fallbackImage.data}`
            return
        }

        this.previewImageUrl = null
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
}
