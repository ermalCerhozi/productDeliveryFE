import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { UserEntity } from 'src/shared/models/user.model'
import { isEqual, cloneDeep } from 'lodash'
import { Clipboard } from '@angular/cdk/clipboard'

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
        private clipboard: Clipboard
    ) {}

    ngOnInit(): void {
        this.loggedInUser = this.bakeryManagementService.getLoggedInUser()
        this.initializeFormWithDefaultValues()
        this.initialFormValues = cloneDeep(this.profileForm.value)
    }

    initializeFormWithDefaultValues() {
        this.profileForm = this.formBuilder.group({
            email: [this.loggedInUser.email, Validators.required],
            phone_number: [this.loggedInUser.phone_number, Validators.required],
            location: [this.loggedInUser.location, Validators.required],
        })
    }

    updateUser() {
        this.bakeryManagementService.updateUser(this.loggedInUser)

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

    isFormChanged() {
        return !isEqual(this.profileForm.value, this.initialFormValues)
    }

    cancelEdition() {
        this.profileForm.setValue(cloneDeep(this.initialFormValues))
    }

    copyToClipboard(value: string) {
        this.clipboard.copy(value)
    }
}
