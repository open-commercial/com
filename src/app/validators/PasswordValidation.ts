import {AbstractControl} from '@angular/forms';

export class PasswordValidation {
    static MatchPassword(AC: AbstractControl) {
        const password = AC.get('password').value;
        const repeatPassword = AC.get('repeatPassword').value;
        if (password !== repeatPassword) {
            AC.get('password').setErrors({MatchPassword: true});
            AC.get('repeatPassword').setErrors({MatchPassword: true});
        } else {
            AC.get('password').setErrors(null);
            AC.get('repeatPassword').setErrors(null);
            return null;
        }
    }
}
