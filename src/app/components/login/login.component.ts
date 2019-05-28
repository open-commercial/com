import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {ActivatedRoute, Router} from '@angular/router';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'sic-com-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  returnUrl = '';
  loginForm: FormGroup;
  usuario: Usuario;
  redirectProductId = 0;

  constructor(private router: Router,
              private authService: AuthService,
              private avisoService: AvisoService,
              private clientesService: ClientesService,
              private fb: FormBuilder,
              private route: ActivatedRoute) {
    this.buildForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
    } else {
      this.route.paramMap.subscribe(params => this.redirectProductId = (Number(params['params'].pid)) || 0);
    }
  }

  buildForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.model = this.loginForm.value;
      this.loading = true;
      this.loginForm.disable();
      this.authService.login(this.model.username, this.model.password).subscribe(
        () => {
          this.authService.getLoggedInUsuario().subscribe((usuario: Usuario) => {
            this.avisoService.openSnackBar(`Bienvenido ${usuario.nombre} ${usuario.apellido}!`, '', 3500);
          });
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
                  if (this.redirectProductId) {
                    this.router.navigate(['/producto', this.redirectProductId]);
                  } else {
                    this.router.navigate(['']);
                  }
                } else {
                  this.avisoService.openSnackBar(
                    'Su usuario no posee cuenta de cliente asociada. Por favor, comuníquese con nosotros.', '', 3500);
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
        });
    }
  }
}
