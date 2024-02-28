import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvisoService } from '../../services/aviso.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
      confirmPassword: ['', [Validators.minLength(6), Validators.maxLength(20), Validators.required]],
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit() {
    const key = this.route.snapshot.queryParams.key;
    const id = this.route.snapshot.queryParams.id;

     if (key && id) {
       this.authService.cambiarPassword(key, id, this.passwordReset.get('password').value).subscribe(
         (token: string) => {
            this.router.navigate(['password-recovery']);
            this.avisoService.openSnackBar('Por favor ingrese su nueva contraseña', 'Cerrar', 0);
            this.authService.setAuthenticationInfo(token);
            this.loading = true;            
            this.router.navigate(['login'])
          
         },
         err => {
           this.avisoService.openSnackBar(err.error, '', 3500);
           //this.router.navigate(['login']); una vez que se cambie el enpoint correcto descomentar el comentario.
         }
       );
     } else {
          //this.router.navigate(['login']); una vez que se cambie el enpoint correcto descomentar el comentario.
     }
  }
  
  newPassword() {
    if (this.passwordReset.valid) {
      const key = this.route.snapshot.queryParams.key;
      const id = this.route.snapshot.queryParams.id;
      const newPassword = this.passwordReset.get('password').value;

      this.authService.cambiarPassword(key, id, this.passwordReset.get('password').value).subscribe(
        () => {
          this.avisoService.openSnackBar('Contraseña cambiada con éxito', 'Cerrar', 0);
          this.router.navigate(['login']);
        },
        err => {
          this.avisoService.openSnackBar('Error al cambiar la contraseña', '', 3500);
        }
      );
    }
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password').value;
    const confirmPassword = formGroup.get('confirmPassword').value;
  
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword').setErrors({ passwordsNotMatching: true });
    } else {
      formGroup.get('confirmPassword').setErrors(null);
    }
  }
}

