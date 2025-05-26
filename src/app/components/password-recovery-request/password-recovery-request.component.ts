import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvisoService } from '../../services/aviso.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'sic-com-password-recovery-request',
  templateUrl: './password-recovery-request.component.html',
  styleUrls: ['password-recovery-request.component.scss']
})
export class PasswordRecoveryRequestComponent implements OnInit {

  requestForm: FormGroup;
  loading = false;

  constructor(private readonly router: Router,
              private readonly authService: AuthService,
              private readonly avisoService: AvisoService,
              private readonly fb: FormBuilder) {
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
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
      this.requestForm.disable();
      this.authService.solicitarCambioContrasenia(email).subscribe(
        () => {
          this.loading = false;
          let message = 'El pedido para recuperar su contraseña ha sido realizado correctamente.';
          message += ' En breve recibirá un correo electrónico con instrucciones';
          this.avisoService.openSnackBar(message, '', 3500);
          this.router.navigate(['']);
        },
        err => {
          this.loading = false;
          this.requestForm.enable();
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
    }
  }
}
