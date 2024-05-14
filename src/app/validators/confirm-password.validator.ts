import { ValidationErrors, ValidatorFn, FormGroup } from "@angular/forms";

export const passwordsMatchValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const newPassword = control.get('newPassword').value;
  const confirmPassword = control.get('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    return { 'passwordMatching': true };
  } else {
    return null;
  }
}
