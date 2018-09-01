import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AvisoService} from '../../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'email-dialog',
  templateUrl: 'email-dialog.component.html',
})
export class EmailDialogComponent implements OnInit {

  emailForm: FormGroup;
  isLoading = false;

  constructor(private dialogRef: MatDialogRef<EmailDialogComponent>,
              private authService: AuthService,
              private avisoService: AvisoService, private fb: FormBuilder) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    if (this.emailForm.valid) {
      const email = this.emailForm.get('email').value;
      this.isLoading = true;
      this.authService.solicitarCambioContrasenia(email).subscribe(
        () => {
          this.dialogRef.close(true);
          this.isLoading = false;
        },
        err => {
          this.isLoading = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
    }
  }
}
