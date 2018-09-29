import {Component, OnInit, AfterContentInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {TipoDeCliente} from '../../models/tipo.cliente';
import {RegistracionService} from '../../services/registracion.service';

@Component({
  selector: 'sic-com-registracion-dialog',
  templateUrl: './registracion-dialog.component.html',
  styleUrls: ['./registracion-dialog.component.scss']
})
export class RegistracionDialogComponent implements OnInit, AfterContentInit {
  loading = false;
  personaForm: FormGroup;
  empresaForm: FormGroup;
  usuario: Usuario;

  keys = Object.keys;
  tiposDeCliente = TipoDeCliente;

  tCliente = null;

  constructor(private dialogRef: MatDialogRef<RegistracionDialogComponent>,
              private dialog: MatDialog, private authService: AuthService,
              private registracionService: RegistracionService,
              private avisoService: AvisoService, private fb: FormBuilder) {

    this.buildPersonaForm();
    this.buildEmpresaForm();
  }

  ngOnInit() {}

  ngAfterContentInit() {
    this.tCliente = 'PERSONA';
  }

  buildPersonaForm() {
    this.personaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  buildEmpresaForm() {
    this.empresaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cuit: ['', Validators.required],
      razonSocial: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  registrarPersona() {
    this.registrar(this.personaForm);
  }

  registrarEmpresa() {
    this.registrar(this.empresaForm);
  }

  registrar(form) {
    if (form.valid) {
      const reg = form.value;
      reg.tipoDeCliente = this.tCliente;

      this.loading = true;
      this.registracionService.registrar(reg).subscribe(
        () => {
          this.loading = false;
          this.dialogRef.close();
          this.avisoService.openSnackBar('Recibirá un email para confirmar su registración.', '', 3500);
        },
        err => {
          this.loading = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );

    }
  }

  onTipoSeleccionado($event) {
    this.tCliente = $event.value;
    if (this.tCliente === 'PERSONA') {
      this.empresaForm.reset();
    } else {
      this.personaForm.reset();
    }
  }
}
