import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class FontService {
    private _fontSize: number

    constructor() {
        const storedFontSize = localStorage.getItem('fontSize')
        if (storedFontSize) {
            this._fontSize = parseInt(storedFontSize, 10)
        } else {
            this._fontSize = 16
            localStorage.setItem('fontSize', this._fontSize.toString())
        }
        this.updateGlobalFontSize()
    }

    setFontSize(size: number): void {
        this._fontSize = size
        localStorage.setItem('fontSize', size.toString())
        this.updateGlobalFontSize()
    }

    getFontSize(): number {
        return this._fontSize
    }

    private updateGlobalFontSize(): void {
        document.documentElement.style.setProperty('--user-font-size', `${this._fontSize}px`)
    }
}
