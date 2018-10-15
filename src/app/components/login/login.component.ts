import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {MatDialog} from '@angular/material';
import {EmailDialogComponent} from './emailDialog/email-dialog.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {RegistracionComponent} from '../registracion/registracion.component';
import {Router} from '@angular/router';

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

  constructor(private router: Router,
              private dialog: MatDialog,
              private authService: AuthService,
              private avisoService: AvisoService,
              private fb: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['productos']);
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
          this.router.navigate(['productos']);
        },
        err => {
          this.loading = false;
          this.loginForm.enable();
          this.avisoService.openSnackBar(err, '', 3500);
        });
    }
  }

  openEmailDialog() {
    const dialogRef = this.dialog.open(EmailDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.avisoService.openSnackBar('Los datos de recupero fueron enviados a su correo electrónico', '', 3500);
      }
    });
  }

  openRegistracionDialog() {
    this.dialog.open(RegistracionComponent);
  }
}
