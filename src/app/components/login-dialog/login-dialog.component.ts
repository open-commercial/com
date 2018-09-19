import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {MatDialog} from '@angular/material';
import {EmailDialogComponent} from './emailDialog/email-dialog.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {RegistracionDialogComponent} from '../registracion-dialog/registracion-dialog.component';

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
      this.loginForm.disable();
      this.authService.login(this.model.username, this.model.password).subscribe(
        data => {
          this.loading = false;
          this.dialogRef.close(true);
          this.loginForm.enable();
        },
        err => {
          this.loading = false;
          this.loginForm.enable();
          this.avisoService.openSnackBar(err, '', 3500);
        });
    }
  }

  openEmailDialog() {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(EmailDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.avisoService.openSnackBar('Los datos de recupero fueron enviados a su correo electrónico', '', 3500);
      }
    });
  }

  openRegistracionDialog() {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(RegistracionDialogComponent);
  }
}
