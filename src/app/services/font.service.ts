import { Injectable } from '@angular/core'

const OPTION_FONT_SIZE_KEY = '--option-font-size'
const TABLE_FONT_SIZE_KEY = '--table-font-size'
const INPUT_FONT_SIZE_KEY = '--input-font-size'

@Injectable({
    providedIn: 'root',
})
export class FontService {
    private _optionFontSize: number = 16
    private _tableFontSize: number = 16
    private _inputFontSize: number = 16

    constructor() {
        this._optionFontSize = this.getFontSize(OPTION_FONT_SIZE_KEY, this._optionFontSize)
        this._tableFontSize = this.getFontSize(TABLE_FONT_SIZE_KEY, this._tableFontSize)
        this._inputFontSize = this.getFontSize(INPUT_FONT_SIZE_KEY, this._inputFontSize)
    }

    private getFontSize(key: string, defaultValue: number): number {
        const storedFontSize = localStorage.getItem(key)
        const fontSize = storedFontSize ? parseInt(storedFontSize, 10) : defaultValue
        this.updateGlobalFontSize(key, fontSize)
        if (!storedFontSize) {
            localStorage.setItem(key, defaultValue.toString())
        }
        return fontSize
    }

    setFontSize(mode: 'option' | 'table' | 'input', size: number): void {
        switch (mode) {
            case 'option':
                this._optionFontSize = size
                this.updateGlobalFontSize(OPTION_FONT_SIZE_KEY, size)
                localStorage.setItem(OPTION_FONT_SIZE_KEY, size.toString())
                break
            case 'table':
                this._tableFontSize = size
                this.updateGlobalFontSize(TABLE_FONT_SIZE_KEY, size)
                localStorage.setItem(TABLE_FONT_SIZE_KEY, size.toString())
                break
            case 'input':
                this._inputFontSize = size
                this.updateGlobalFontSize(INPUT_FONT_SIZE_KEY, size)
                localStorage.setItem(INPUT_FONT_SIZE_KEY, size.toString())
                break
            default:
                console.warn(`Unknown mode: ${mode}`)
        }
    }

    private updateGlobalFontSize(selector: string, size: number): void {
        document.documentElement.style.setProperty(selector, `${size}px`)
    }

    get optionFontSize(): number {
        return this._optionFontSize
    }

    get tableFontSize(): number {
        return this._tableFontSize
    }

    get inputFontSize(): number {
        return this._inputFontSize
    }
}
