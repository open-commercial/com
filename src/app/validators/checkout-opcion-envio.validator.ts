import {FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

export const sucursalValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const opcionEnvio = control.get('opcionEnvio');
  const sucursal = control.get('sucursal');

  return opcionEnvio && sucursal && opcionEnvio.value === '1' && !sucursal.value ?
    { 'requiredSucursal': true } : null;
};
