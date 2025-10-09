import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AvisoService } from '../../services/aviso.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'sic-com-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl = '';
  loginForm: UntypedFormGroup;
  usuario: Usuario;

  constructor(private readonly router: Router,
    private readonly authService: AuthService,
    private readonly avisoService: AvisoService,
    private readonly clientesService: ClientesService,
    private readonly fb: UntypedFormBuilder,
    private readonly route: ActivatedRoute) {
    this.buildForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
    } else {
      this.route.queryParamMap.subscribe(params => {
        if (params.has('return')) {
          this.returnUrl = params.get('return');
        }
      });
    }
  }

  buildForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(250)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(250)]],
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.model = this.loginForm.value;
      this.loading = true;
      this.loginForm.disable();
      this.authService.login(this.model.username, this.model.password).subscribe(
        () => {
          this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
            .pipe(
              finalize(() => {
                this.loginForm.reset();
                this.loginForm.enable();
              })
            )
            .subscribe(
              (cliente: Cliente) => {
                if (cliente) {
                  if (this.returnUrl) {
                    this.router.navigateByUrl(this.returnUrl);
                  } else {
                    this.router.navigate(['']);
                  }
                } else {
                  let msjError = 'Su usuario no posee cuenta de cliente asociada. Por favor, comuníquese con nosotros.';
                  this.avisoService.openSnackBar(msjError, '', 3500);
                  this.authService.logout();
                }
                this.loading = false;
              },
              err => {
                this.loading = false;
                this.avisoService.openSnackBar(err, '', 3500);
                this.authService.logout();
              }
            );
        },
        err => {
          this.loading = false;
          this.loginForm.enable();
          this.avisoService.openSnackBar(err, '', 3500);
        })
        ;
    }
  }
}
