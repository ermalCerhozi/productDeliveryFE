import { Injectable } from '@angular/core'

const SEND_CREATE_NOTIFICATION = 'send-created-notification'
const SEND_UPDATE_NOTIFICATION = 'send-updated-notification'
const SEND_DELETE_NOTIFICATION = 'send-deleted-notification'

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private _sendCreatedNotification = true
    private _sendUpdatedNotification = false
    private _sendDeletedNotification = false

    constructor() {
        this._sendCreatedNotification = this.getBooleanFromLocalStorage(
            SEND_CREATE_NOTIFICATION,
            this._sendCreatedNotification
        )
        this._sendUpdatedNotification = this.getBooleanFromLocalStorage(
            SEND_UPDATE_NOTIFICATION,
            this._sendUpdatedNotification
        )
        this._sendDeletedNotification = this.getBooleanFromLocalStorage(
            SEND_DELETE_NOTIFICATION,
            this._sendDeletedNotification
        )
    }

    getBooleanFromLocalStorage(key: string, defaultValue: boolean): boolean {
        const storedConfigValue = localStorage.getItem(key)
        if (storedConfigValue !== null) {
            return storedConfigValue === 'true'
        } else {
            localStorage.setItem(key, defaultValue.toString())
            return defaultValue
        }
    }

    setBooleanToLocalStorage(key: string, value: boolean): void {
        switch (key) {
            case SEND_CREATE_NOTIFICATION:
                this._sendCreatedNotification = value
                break
            case SEND_UPDATE_NOTIFICATION:
                this._sendUpdatedNotification = value
                break
            case SEND_DELETE_NOTIFICATION:
                this._sendDeletedNotification = value
                break
            default:
                console.warn(`Unknown key: ${key}`)
                return
        }
        localStorage.setItem(key, value.toString())
    }

    get sendCreatedNotification(): boolean {
        return this._sendCreatedNotification
    }

    get sendUpdatedNotification(): boolean {
        return this._sendUpdatedNotification
    }

    get sendDeletedNotification(): boolean {
        return this._sendDeletedNotification
    }
}
