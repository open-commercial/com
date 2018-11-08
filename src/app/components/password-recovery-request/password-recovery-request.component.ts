import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'sic-com-password-recovery-request',
  templateUrl: './password-recovery-request.component.html',
  styleUrls: ['password-recovery-request.component.scss']
})
export class PasswordRecoveryRequestComponent implements OnInit {

  requestForm: FormGroup;
  loading = false;

  constructor(private router: Router,
              private authService: AuthService,
              private avisoService: AvisoService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['productos']);
    }

    this.createForm();
  }

  createForm() {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  request() {
    if (this.requestForm.valid) {
      const email = this.requestForm.get('email').value;
      this.loading = true;
      this.authService.solicitarCambioContrasenia(email).subscribe(
        () => {
          this.loading = false;
          let message = 'El pedido para recuperar su contraseña ha sido realizado correctamente.';
          message += ' En breve recibirá un correo electrónico con instrucciones.';
          this.avisoService.openSnackBar(message, '', 5000);
          this.router.navigate(['productos']);
        },
        err => {
          this.loading = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
    }
  }
}
