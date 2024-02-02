import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { UserEntity } from 'src/shared/models/user.model'

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef
    loggedInUser!: UserEntity
    url = ''

    constructor(private bakeryManagementService: BakeryManagementService) {}

    ngOnInit(): void {
        this.loggedInUser = this.bakeryManagementService.getLoggedInUser()
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
}
