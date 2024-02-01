import { Component, OnInit } from '@angular/core'
import { BakeryManagementService } from 'src/services/bakery-management.service'
import { UserEntity } from 'src/shared/models/user.model'

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    loggedInUser!: UserEntity

    constructor(private bakeryManagementService: BakeryManagementService) {}

    ngOnInit(): void {
        this.loggedInUser = this.bakeryManagementService.getLoggedInUser()
    }

    onSubmit() {
        this.bakeryManagementService.updateUser(this.loggedInUser)
    }
}
