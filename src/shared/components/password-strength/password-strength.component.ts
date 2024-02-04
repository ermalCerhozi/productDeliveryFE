import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core'
import { AbstractControl, FormGroup } from '@angular/forms'

import { Subscription } from 'rxjs'

interface Hint {
    message: string
    color: string
}

interface Constants {
    readonly DIGIT_REGEX: RegExp
    initialCopyrightYear: number
    readonly SYMBOL_REGEX: RegExp
}

const CONSTANTS: Constants = {
    DIGIT_REGEX: /[0-9]/,
    initialCopyrightYear: 2021,
    SYMBOL_REGEX: /[-+_!@#$%^&*,.?]/,
}

@Component({
    selector: 'app-password-strength',
    templateUrl: './password-strength.component.html',
    styleUrls: ['./password-strength.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStrengthComponent implements OnInit, OnDestroy {
    @Input() public form: FormGroup = new FormGroup({})

    private subscriptions: Subscription[] = []
    public strengthHint: Hint = {
        message: '',
        color: 'red',
    }
    passwordSlider = 0

    ngOnInit(): void {
        this.setIndicatorValues(this.password.value)
        this.setupConditionalValidators()
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe())
    }

    private setIndicatorValues(controlValue: string): void {
        let passwordSliderMinValue = 0
        let passwordSliderSpecialValue = 0
        let passwordSliderDigitValue = 0

        if (controlValue.length >= 8) {
            this.passwordMin.setValue(true)
            passwordSliderMinValue = 1
        } else {
            this.passwordMin.setValue(false)
            passwordSliderMinValue = 0
        }
        if (CONSTANTS.SYMBOL_REGEX.test(controlValue)) {
            this.passwordSpecial.setValue(true)
            passwordSliderSpecialValue = 1
        } else {
            this.passwordSpecial.setValue(false)
            passwordSliderSpecialValue = 0
        }
        if (CONSTANTS.DIGIT_REGEX.test(controlValue)) {
            this.passwordDigit.setValue(true)
            passwordSliderDigitValue = 1
        } else {
            this.passwordDigit.setValue(false)
            passwordSliderDigitValue = 0
        }
        this.passwordSlider =
            passwordSliderMinValue + passwordSliderSpecialValue + passwordSliderDigitValue
        console.log(this.passwordSlider)
        switch (this.passwordSlider) {
            case 0:
                this.strengthHint.message = 'Weak'
                this.strengthHint.color = 'red'
                break
            case 1:
                this.strengthHint.message = 'Okay'
                this.strengthHint.color = 'orange'
                break
            case 2:
                this.strengthHint.message = 'Good'
                this.strengthHint.color = 'yellow'
                break
            case 3:
                this.strengthHint.message = 'Strong'
                this.strengthHint.color = 'green'
                break
        }
    }

    /** Listens to the password input in the form and updates the requirements list. */
    private setupConditionalValidators(): void {
        const passwordControlSubscription: Subscription = this.password.valueChanges.subscribe(
            (controlValue: string) => this.setIndicatorValues(controlValue)
        )
        this.subscriptions.push(passwordControlSubscription)
    }

    private get password(): AbstractControl {
        return this.form.get('password') as AbstractControl
    }
    private get passwordMin(): AbstractControl {
        return this.form.get('passwordMin') as AbstractControl
    }
    private get passwordDigit(): AbstractControl {
        return this.form.get('passwordDigit') as AbstractControl
    }
    private get passwordSpecial(): AbstractControl {
        return this.form.get('passwordSpecial') as AbstractControl
    }
}
