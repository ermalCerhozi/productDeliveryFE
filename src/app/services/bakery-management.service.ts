import { Injectable, inject } from "@angular/core"

import { Observable, tap } from "rxjs"

import { ImageUploadRequest, ImageResponse } from "../shared/models/image.model"
import { UserEntity } from "../shared/models/user.model"
import { BakeryManagementApiService } from "./bakery-management-api.service"

@Injectable({
    providedIn: 'root',
})
export class BakeryManagementService {
    private bakeryManagementApiService = inject(BakeryManagementApiService)

    downloadOrdersPdf(requestPayload: any): void {
        this.bakeryManagementApiService.downloadOrdersPdf(requestPayload).subscribe((data: any) => {
            const blob = new Blob([data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'orders.pdf'
            link.click()
        })
    }

    downloadOrdersCsv(requestPayload: any): void {
        this.bakeryManagementApiService.downloadOrdersCsv(requestPayload).subscribe((data: any) => {
            const blob = new Blob([data], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'orders.csv'
            link.click()
        })
    }

    uploadImage(payload: ImageUploadRequest): Observable<ImageResponse> {
        return this.bakeryManagementApiService.uploadImage(payload).pipe(
            tap((image) => {
                if (!image) {
                    console.warn('Image upload completed without a payload response')
                    return
                }

                if (!payload.userId) {
                    return
                }

                if (!image.contentType || !image.data) {
                    console.error('Image upload response is missing binary payload metadata')
                    return
                }

                const currentUserRaw = localStorage.getItem('currentUser')
                if (!currentUserRaw) {
                    return
                }

                try {
                    const currentUser = JSON.parse(currentUserRaw) as UserEntity
                    if (currentUser?.id === payload.userId) {
                        const dataUri = `data:${image.contentType};base64,${image.data}`
                        const updatedUser = {
                            ...currentUser,
                            profile_picture: dataUri,
                        }
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
                    }
                } catch (error) {
                    console.error('Failed to update cached user image', error)
                }
            })
        )
    }
}
