import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {MatDialog} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';

@Component({
  selector: 'sic-com-registracion-dialog',
  templateUrl: './registracion-dialog.component.html',
  styleUrls: ['./registracion-dialog.component.scss']
})
export class RegistracionDialogComponent implements OnInit {
  loading = false;
  personaForm: FormGroup;
  empresaForm: FormGroup;
  usuario: Usuario;

  constructor(private dialogRef: MatDialogRef<RegistracionDialogComponent>,
              private dialog: MatDialog, private authService: AuthService,
              private avisoService: AvisoService, private fb: FormBuilder) {
    this.buildPersonaForm();
    this.buildEmpresaForm();
  }

  ngOnInit() {}

  buildPersonaForm() {
    this.personaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  buildEmpresaForm() {
    this.empresaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      cuit: ['', Validators.required],
      razonSocial: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  registrarPersona() {
    if (this.personaForm.valid) {
    }
  }

  registrarEmpresa() {
    if (this.personaForm.valid) {
    }
  }
}
