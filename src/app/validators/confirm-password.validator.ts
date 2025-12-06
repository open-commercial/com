import { ValidationErrors, ValidatorFn, UntypedFormGroup } from "@angular/forms";

export const passwordsMatchValidator: ValidatorFn = (control: UntypedFormGroup): ValidationErrors | null => {
  const newPassword = control.get('newPassword').value;
  const confirmPassword = control.get('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    return { 'passwordMatching': true };
  } else {
    return null;
  }
}
