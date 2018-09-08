import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {MatDialog} from '@angular/material';
import {EmailDialogComponent} from './emailDialog/email-dialog.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';

@Component({
  selector: 'sic-com-login',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl = '';
  loginForm: FormGroup;
  usuario: Usuario;

  constructor(private dialogRef: MatDialogRef<LoginDialogComponent>,
              private dialog: MatDialog, private authService: AuthService,
              private avisoService: AvisoService, private fb: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {}

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
      this.authService.login(this.model.username, this.model.password).subscribe(
        data => {
          this.authService.getLoggedInUsuario()
            .subscribe(
              (usuario: Usuario) => {
                this.authService.setNombreUsuarioLoggedIn(usuario.nombre + ' ' + usuario.apellido);
                setTimeout(() => {
                  this.loading = false;
                  this.dialogRef.close(true);
                }, 1000);
              },
              err => {
                this.avisoService.openSnackBar(err.error, '', 3500);
                this.loading = false;
                this.dialogRef.close(true);
              }
            );
        },
        err => {
          this.loading = false;
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
}
