import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { BakeryManagementService } from 'src/app/services/bakery-management.service'
import { UserEntity } from 'src/app/shared/models/user.model'
import { isEqual, cloneDeep } from 'lodash'
import { MatDialog } from '@angular/material/dialog'
import { ChangePasswordComponent } from 'src/app/track-ease/change-password/change-password.component'

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef
    profileForm!: FormGroup
    loggedInUser!: UserEntity
    initialFormValues!: any
    url = ''

    constructor(
        private bakeryManagementService: BakeryManagementService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loggedInUser = this.bakeryManagementService.getLoggedInUser()
        this.initializeFormWithDefaultValues()
        this.initialFormValues = cloneDeep(this.profileForm.value)
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
                this.loggedInUser.profile_picture = reader.result as string
                this.updateUser()
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
