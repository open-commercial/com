import {Component, OnInit, AfterContentInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {TipoDeCliente} from '../../models/tipo.cliente';
import {RegistracionService} from '../../services/registracion.service';
import {Router} from '@angular/router';

@Component({
  selector: 'sic-com-registracion',
  templateUrl: './registracion.component.html',
  styleUrls: ['./registracion.component.scss']
})
export class RegistracionComponent implements OnInit, AfterContentInit {
  loading = false;
  personaForm: FormGroup;
  empresaForm: FormGroup;
  usuario: Usuario;

  keys = Object.keys;
  tiposDeCliente = TipoDeCliente;

  tCliente = null;

  constructor(private authService: AuthService, private router: Router,
              private registracionService: RegistracionService,
              private avisoService: AvisoService, private fb: FormBuilder) {

    this.buildPersonaForm();
    this.buildEmpresaForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.avisoService.openSnackBar('Hay un usuario logueado no puede ir a registración.', '', 3500);
      this.router.navigate(['productos']);
    }
  }

  ngAfterContentInit() {
    this.tCliente = 'EMPRESA';
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
      form.disable();
      this.registracionService.registrar(reg).subscribe(
        () => {
          this.loading = false;
          this.avisoService.openSnackBar('Recibirá un email para confirmar su registración.', '', 3500);
          this.router.navigate(['login']);
        },
        err => {
          this.loading = false;
          form.enable();
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
