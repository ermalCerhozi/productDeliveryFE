import {
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    signal,
    computed,
    viewChild,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import {
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
    NonNullableFormBuilder,
} from '@angular/forms'
import { DatePipe } from '@angular/common'

import { finalize, catchError, EMPTY, tap } from 'rxjs'
import { MatButton, MatIconButton } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { MatToolbar } from '@angular/material/toolbar'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'

import { UserEntity } from 'src/app/shared/models/user.model'
import { ChangePasswordComponent } from 'src/app/track-ease/change-password/change-password.component'
import { ImageResponse } from 'src/app/shared/models/image.model'
import { TranslocoDirective } from '@jsverse/transloco'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'

const PHONE_PATTERN = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
const DEFAULT_AVATAR = '/assets/images/avatar.png'

interface ProfileFormValue {
    id: number
    email: string
    phone_number: string
    location: string
}
    
@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [
        MatButton,
        MatIcon,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatIconButton,
        MatSuffix,
        MatToolbar,
        DatePipe,
        TranslocoDirective,
    ],
})
export class UserProfileComponent {
    private readonly apiService = inject(BakeryManagementApiService)
    private readonly managementService = inject(BakeryManagementService)
    private readonly fb = inject(NonNullableFormBuilder)
    private readonly dialog = inject(MatDialog)
    private readonly destroyRef = inject(DestroyRef)
    private readonly snackBar = inject(MatSnackBar)

    // ViewChild using modern signal-based approach
    readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput')

    // Signal-based reactive state
    readonly user = signal<UserEntity | null>(null)
    readonly profilePicture = signal<string>(DEFAULT_AVATAR)
    readonly isLoading = signal<boolean>(false)
    readonly isUploadingImage = signal<boolean>(false)
    readonly errorMessage = signal<string | null>(null)

    // Form setup with proper typing
    readonly profileForm: FormGroup<{
        id: any
        email: any
        phone_number: any
        location: any
    }>

    // Computed signal for form change detection
    readonly hasFormChanges = computed(() => {
        const form = this.profileForm
        return form.dirty && form.valid
    })

    // Computed signal for avatar URL
    readonly avatarUrl = computed(() => {
        const picture = this.profilePicture()
        return picture || DEFAULT_AVATAR
    })

    // Computed signal for display name
    readonly displayName = computed(() => {
        const currentUser = this.user()
        if (!currentUser) return ''
        return `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
    })

    // Computed signal for registration date
    readonly registrationDate = computed(() => {
        const currentUser = this.user()
        return currentUser?.created_at || null
    })

    constructor() {
        this.profileForm = this.fb.group({
            id: [0],
            email: ['', [Validators.required, Validators.email]],
            phone_number: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
            location: [''],
        })

        // Initialize user from localStorage and fetch fresh data
        this.initializeUser()

        // Effect to update form when user changes
        effect(() => {
            const currentUser = this.user()
            if (currentUser) {
                this.updateFormWithUserData(currentUser)
            }
        })
    }

    /**
     * Initialize user from cached data and fetch fresh data from API
     */
    private initializeUser(): void {
        const cachedUser = this.getCachedUser()

        if (!cachedUser?.id) {
            this.errorMessage.set('Unable to load user profile. Please log in again.')
            return
        }

        // Set initial user data from cache
        this.user.set(cachedUser)
        this.profilePicture.set(cachedUser.profile_picture || DEFAULT_AVATAR)

        // Fetch fresh user data from API
        this.refreshUserProfile(cachedUser.id)
    }

    /**
     * Fetch fresh user data from API
     */
    private refreshUserProfile(userId: number): void {
        this.isLoading.set(true)
        this.errorMessage.set(null)

        this.apiService
            .getUser(userId)
            .pipe(
                tap((freshUser) => {
                    this.user.set(freshUser)
                    this.profilePicture.set(freshUser.profile_picture || DEFAULT_AVATAR)
                    this.updateCachedUser(freshUser)
                }),
                catchError((error) => {
                    console.error('Failed to refresh user profile:', error)
                    this.errorMessage.set('Failed to load user profile. Using cached data.')
                    this.showNotification('Failed to refresh profile data', 'error')
                    return EMPTY
                }),
                finalize(() => this.isLoading.set(false)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe()
    }

    /**
     * Update form controls with user data
     */
    private updateFormWithUserData(userData: UserEntity): void {
        this.profileForm.patchValue(
            {
                id: userData.id,
                email: userData.email,
                phone_number: userData.phone_number,
                location: userData.location || '',
            },
            { emitEvent: false }
        )
        this.profileForm.markAsPristine()
    }

    /**
     * Get cached user from localStorage with proper error handling
     */
    private getCachedUser(): UserEntity | null {
        try {
            const userJson = localStorage.getItem('currentUser')
            if (!userJson) return null
            return JSON.parse(userJson) as UserEntity
        } catch (error) {
            console.error('Failed to parse cached user data:', error)
            return null
        }
    }

    /**
     * Update cached user in localStorage
     */
    private updateCachedUser(userData: UserEntity): void {
        try {
            localStorage.setItem('currentUser', JSON.stringify(userData))
        } catch (error) {
            console.error('Failed to update cached user:', error)
        }
    }

    /**
     * Open file input dialog for profile picture upload
     */
    openUploadPanel(): void {
        const input = this.fileInput()
        if (input?.nativeElement) {
            input.nativeElement.click()
        }
    }

    /**
     * Handle file selection for profile picture upload
     */
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement
        const file = input.files?.[0]

        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error')
            return
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            this.showNotification('Image size must be less than 5MB', 'error')
            return
        }

        this.uploadProfileImage(file)
    }

    /**
     * Upload profile image to server
     */
    private uploadProfileImage(file: File): void {
        const currentUser = this.user()
        if (!currentUser?.id) {
            this.showNotification('User not found', 'error')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            const base64 = result?.split(',')[1]

            if (!base64) {
                this.showNotification('Failed to process image', 'error')
                return
            }

            this.isUploadingImage.set(true)

            this.managementService
                .uploadImage({
                    fileName: file.name,
                    contentType: file.type,
                    data: base64,
                    userId: currentUser.id,
                })
                .pipe(
                    tap((image: ImageResponse) => {
                        if (image?.contentType && image?.data) {
                            const dataUri = `data:${image.contentType};base64,${image.data}`
                            this.profilePicture.set(dataUri)

                            // Update user signal with new profile picture
                            const updatedUser = { ...currentUser, profile_picture: dataUri }
                            this.user.set(updatedUser)

                            this.showNotification('Profile picture updated successfully', 'success')
                        }
                    }),
                    catchError((error) => {
                        console.error('Failed to upload image:', error)
                        this.showNotification('Failed to upload profile picture', 'error')
                        return EMPTY
                    }),
                    finalize(() => {
                        this.isUploadingImage.set(false)
                        // Clear file input
                        const input = this.fileInput()
                        if (input?.nativeElement) {
                            input.nativeElement.value = ''
                        }
                    }),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe()
        }

        reader.onerror = () => {
            this.showNotification('Failed to read image file', 'error')
        }

        reader.readAsDataURL(file)
    }

    /**
     * Open link in new window with security measures
     */
    openInNewWindow(url: string): void {
        if (!url) return

        try {
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
            if (!newWindow) {
                this.showNotification(
                    'Unable to open link. Please check your browser settings.',
                    'error'
                )
            }
        } catch (error) {
            console.error('Failed to open window:', error)
            this.showNotification('Failed to open link', 'error')
        }
    }

    /**
     * Open change password dialog
     */
    openChangePasswordDialog(): void {
        const dialogRef = this.dialog.open(ChangePasswordComponent, {
            width: '400px',
            disableClose: true,
        })

        dialogRef
            .afterClosed()
            .pipe(
                tap((result) => {
                    if (result) {
                        const currentUser = this.user()
                        if (!currentUser?.id) return

                        this.apiService
                            .changeUserPassword(currentUser.id, result)
                            .pipe(
                                tap(() => {
                                    this.showNotification(
                                        'Password changed successfully',
                                        'success'
                                    )
                                }),
                                catchError((error) => {
                                    console.error('Failed to change password:', error)
                                    this.showNotification('Failed to change password', 'error')
                                    return EMPTY
                                }),
                                takeUntilDestroyed(this.destroyRef)
                            )
                            .subscribe()
                    }
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe()
    }

    /**
     * Cancel form edits and reset to original values
     */
    cancelEdition(): void {
        const currentUser = this.user()
        if (currentUser) {
            this.updateFormWithUserData(currentUser)
        }
        this.profileForm.markAsPristine()
    }

    /**
     * Update user profile
     */
    updateUser(): void {
        if (!this.profileForm.valid) {
            this.showNotification('Please fix form errors', 'error')
            return
        }

        const currentUser = this.user()
        if (!currentUser?.id) {
            this.showNotification('User not found', 'error')
            return
        }

        const formValue = this.profileForm.getRawValue() as ProfileFormValue

        this.isLoading.set(true)

        this.apiService
            .updateUser(currentUser, formValue)
            .pipe(
                tap(() => {
                    // Update local user state
                    const updatedUser: UserEntity = {
                        ...currentUser,
                        ...formValue,
                    }
                    this.user.set(updatedUser)
                    this.updateCachedUser(updatedUser)

                    this.profileForm.markAsPristine()
                    this.showNotification('Profile updated successfully', 'success')
                }),
                catchError((error) => {
                    console.error('Failed to update user:', error)
                    this.showNotification('Failed to update profile', 'error')
                    return EMPTY
                }),
                finalize(() => this.isLoading.set(false)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe()
    }

    /**
     * Show notification to user
     */
    private showNotification(message: string, type: 'success' | 'error'): void {
        this.snackBar.open(message, 'Close', {
            duration: type === 'success' ? 3000 : 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
        })
    }

    /**
     * Get form control error message for display
     */
    getErrorMessage(controlName: string): string {
        const control = this.profileForm.get(controlName)
        if (!control?.errors) return ''

        if (control.errors['required']) {
            return 'This field is required'
        }
        if (control.errors['email']) {
            return 'Please enter a valid email address'
        }
        if (control.errors['pattern']) {
            return 'Please enter a valid phone number'
        }
        return 'Invalid input'
    }
}
