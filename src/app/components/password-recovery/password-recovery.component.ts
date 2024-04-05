import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvisoService } from '../../services/aviso.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordRecovery } from 'app/models/password-recovery';

@Component({
  selector: 'sic-com-password-reset',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit {
  passwordReset: FormGroup;
  model: any = {};
  loading = false;
  returnUrl = '';


  constructor(private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private avisoService: AvisoService,
    private fb: FormBuilder) {
    this.passwordReset = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit() {
    const key = this.route.snapshot.queryParams.key;
    const id = this.route.snapshot.queryParams.id;
    if (!key || !id) {
      this.router.navigate(['login']);
    }
  }

  changePassword() {
    if (this.passwordReset.valid) {
      const key = this.route.snapshot.queryParams.key;
      const id = this.route.snapshot.queryParams.id;
      const newPassword = this.passwordReset.get('password').value;

      const passwordRecoveryData: PasswordRecovery = {
        key: key,
        id: id,
        newPassword: newPassword
      };

      this.authService.cambiarPassword(passwordRecoveryData).subscribe(
        () => {
          this.avisoService.openSnackBar('Por favor ingrese su nueva contraseña', 'Cerrar', 0);
          this.loading = true;
          console.log('Contraseña modificada')
          this.avisoService.openSnackBar('Contraseña cambiada con éxito', '', 0);
          this.router.navigate(['login']);
        },
        err => {
          if (err.status === 400) {
            this.avisoService.openSnackBar('Error al cambiar la contraseña', '', 3500);
          } else if (err.status === 401) {
            this.avisoService.openSnackBar('Sus datos de recuperación ya expiraron', '', 3500);
          } else if (err.status === 0) {
            this.avisoService.openSnackBar('Error de conexión. Por favor, inténtelo de nuevo más tarde', '', 3500);
          } else {
            this.avisoService.openSnackBar('Error al cambiar la contraseña. Por favor, inténtelo de nuevo más tarde', '', 3500);
          }
        }
      );
    }
  }

  passwordsMatchValidator = (formGroup: FormGroup) => {
    const password = formGroup.get('password').value;
    const confirmPassword = formGroup.get('confirmPassword').value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword').setErrors({ passwordsNotMatching: true });
    } else {
      formGroup.get('confirmPassword').setErrors(null);
    }
  };
}

