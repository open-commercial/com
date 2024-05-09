import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvisoService } from '../../services/aviso.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordRecovery } from 'app/models/password-recovery';
import { passwordsMatchValidator } from 'app/validators/confirm-password.validator';

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
  showError: boolean = false;
  
  constructor(private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService,
              private avisoService: AvisoService,
              private fb: FormBuilder) {
    this.passwordReset = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],

    });
    this.passwordReset.setValidators(passwordsMatchValidator);
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
      if (this.passwordReset.get('newPassword').value !== this.passwordReset.get('confirmPassword').value) {
          this.passwordReset.get('confirmPassword').setErrors({ passwordsNotMatching: true });
          this.showError = true;
        return; 
      }
      
      const passwordRecoveryData: PasswordRecovery = {
        key: this.route.snapshot.queryParams.key,
        id: this.route.snapshot.queryParams.id,
        newPassword: this.passwordReset.get('newPassword').value
      };

      this.passwordReset.disable();
      this.loading = true;
      this.authService.cambiarPassword(passwordRecoveryData).subscribe(
        () => {
          this.loading = false;
          this.avisoService.openSnackBar('Contraseña cambiada con éxito', 'Cerrar', 0);
          this.router.navigate(['login']);
        },
        error => {
          this.loading = false;
          this.passwordReset.enable()
          this.avisoService.openSnackBar(error, '', 3500);
        });
    } else {
      this.showError = true;
    }
  }
}
