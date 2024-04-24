import { ValidationErrors, ValidatorFn, FormGroup } from "@angular/forms";

export const passwordsMatchValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const newPassword = control.get('newPassword').value;
    const confirmPassword = control.get('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      return { passwordsNotMatching: true };
    } 

    if (newPassword ==='' && confirmPassword ==='') {
      return {requiredNewPassword: true};
    }

    return null;
  };
