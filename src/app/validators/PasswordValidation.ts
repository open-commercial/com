import {AbstractControl} from '@angular/forms';

export class PasswordValidation {
    static MatchPassword(AC: AbstractControl) {
        const passwordCtrl = AC.get('password');
        const repeatPasswordCtrl = AC.get('repeatPassword');

        if (passwordCtrl && repeatPasswordCtrl && passwordCtrl.value !== repeatPasswordCtrl.value) {
          AC.get('password').setErrors({ MatchPassword: true });
          AC.get('repeatPassword').setErrors({ MatchPassword: true });
        } else {
          if (passwordCtrl) {
            passwordCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
          }
          if (repeatPasswordCtrl) {
            repeatPasswordCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
          }
          return null;
        }
    }
}
