import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvisoService } from '../../services/aviso.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PasswordRecovery } from 'app/models/password-recovery';
import { passwordsMatchValidator } from 'app/validators/confirm-password.validator';

@Component({
  selector: 'sic-com-password-reset',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit {

  passwordResetForm: UntypedFormGroup;
  loading = false;
  
  constructor(private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService,
              private avisoService: AvisoService,
              private fb: UntypedFormBuilder) {
    this.passwordResetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    });
    this.passwordResetForm.setValidators(passwordsMatchValidator);
  }

  ngOnInit() {
    const key = this.route.snapshot.queryParams.key;
    const id = this.route.snapshot.queryParams.id;
    if (!key || !id) {
      this.router.navigate(['login']);
    }
  }

  changePassword() {
    if (this.passwordResetForm.valid) {
      const passwordRecoveryData: PasswordRecovery = {
        key: this.route.snapshot.queryParams.key,
        id: this.route.snapshot.queryParams.id,
        newPassword: this.passwordResetForm.get('newPassword').value
      };
  
      this.passwordResetForm.disable();
      this.loading = true;
      this.authService.cambiarPassword(passwordRecoveryData).subscribe(
        () => {
          this.loading = false;
          this.avisoService.openSnackBar('Contraseña cambiada con éxito', 'Cerrar', 0);
          this.router.navigate(['login']);
        },
        error => {
          this.loading = false;
          this.passwordResetForm.enable();
          this.avisoService.openSnackBar(error.error, '', 3500);
        });
    }
  }
}
