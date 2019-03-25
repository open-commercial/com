import {Component, Input, OnChanges, SimpleChange, OnInit, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {CategoriaIVA} from '../../models/categoria-iva';
import {Ubicacion} from '../../models/ubicacion';
import {UbicacionService} from '../../services/ubicacion.service';
import {forkJoin} from 'rxjs';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'sic-com-cliente',
  templateUrl: 'cliente.component.html',
  styleUrls: ['cliente.component.scss']
})
export class ClienteComponent implements OnInit, OnChanges {

  @Input() c: Cliente;
  @Input() editionMode = true;
  @Output() updated = new EventEmitter<Cliente>(true);
  @Output() modeStatusChanged = new EventEmitter<boolean>(true);

  inEdition = false;
  clienteForm: FormGroup;
  cliente: Cliente = null;
  isLoading = false;

  // Lo siguiente es para poder iterar sobre el enum de CategoriaIVA en la vista:
  // Se guarda el metodo keys de Object en una variable
  keys = Object.keys;
  // Asigno el enum a una variable
  categoriasIVA = CategoriaIVA;

  ubicacionFacturacion: Ubicacion = null;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private avisoService: AvisoService,
              private clientesService: ClientesService,
              private ubicacionService: UbicacionService) {
  }

  createForm() {
    this.clienteForm = this.fb.group({
      idFiscal: ['', Validators.pattern('^[0-9]*$')],
      nombreFiscal: ['', Validators.required],
      nombreFantasia: '',
      categoriaIVA: [null, Validators.required],
      telefono: ['', Validators.required],
      email: ['', Validators.email],
    });

    this.clienteForm.get('categoriaIVA').valueChanges.subscribe(
      value => {
        if (value === 'CONSUMIDOR_FINAL') {
          this.clienteForm.get('nombreFantasia').setValue('');
        }
      }
    );
  }

  ngOnInit() {
    this.createForm();

    if (!this.c) {
      this.isLoading = true;
      this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
        (cliente: Cliente) => {
          if (cliente) {
            this.asignarCliente(cliente);
          }
        },
        error => this.isLoading = false
      );
    }
  }

  asignarCliente(newCliente: Cliente) {
    this.cliente = newCliente;

    if (!this.cliente) {
      this.ubicacionFacturacion = null;
      return;
    }

    // Sincronizo la ubicación de Facturación
    if (this.cliente.idUbicacionFacturacion) {
      if (!this.isLoading) { this.isLoading = true; }
      this.ubicacionService.getUbicacion(this.cliente.idUbicacionFacturacion)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(
          (u: Ubicacion) => this.ubicacionFacturacion = u,
          err => this.avisoService.openSnackBar(err.error, '', 3500)
        );
    } else {
      this.isLoading = false;
    }
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.c !== undefined) {
      this.asignarCliente(changes.c.currentValue);
    }

    if (changes.editionMode !== undefined) {
      this.changeModeStatus(changes.editionMode.currentValue);
    }
  }

  toggleEdit() {
    this.changeModeStatus(!this.inEdition);
    this.rebuildForm();
  }

  changeModeStatus(status) {
    this.inEdition = status;
    this.modeStatusChanged.emit(status);
  }

  submit() {
    if (this.clienteForm.valid) {
      const cliente = this.getFormValues();
      const ubicacionFacturacion = this.getUbicacionFormValues('ubicacionFacturacion', this.ubicacionFacturacion);

      const clienteObservable   = this.clientesService.saveCliente(cliente);
      const ubicacionObservable = this.ubicacionFacturacion && this.ubicacionFacturacion.idUbicacion
        ? this.ubicacionService.updateUbicacion(ubicacionFacturacion)
        : this.ubicacionService.createUbicacionFacturacionCliente(cliente, ubicacionFacturacion);

      this.isLoading = true;

      forkJoin(clienteObservable, ubicacionObservable)
        .subscribe((data) => {
          this.clientesService.getCliente(this.cliente.id_Cliente)
            .subscribe((newcliente: Cliente) => {
              if (newcliente) {
                this.asignarCliente(newcliente);
                this.updated.emit(this.cliente);
                this.changeModeStatus(false);
              } else {
                this.isLoading = false;
              }
            });
        },
        err => {
          this.isLoading = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
    }
  }

  getFormValues(): any {
    return {
      id_Cliente: this.cliente ? this.cliente.id_Cliente : null,
      nombreFiscal: this.clienteForm.get('nombreFiscal').value,
      nombreFantasia: this.clienteForm.get('nombreFantasia').value,
      idFiscal: this.clienteForm.get('idFiscal').value,
      email: this.clienteForm.get('email').value,
      telefono: this.clienteForm.get('telefono').value,
      contacto: this.cliente ? this.cliente.contacto : '',
      categoriaIVA: this.clienteForm.get('categoriaIVA').value,
      idCredencial: this.authService.getLoggedInIdUsuario(),
      idViajante: this.cliente ? this.cliente.idViajante : null,
    };
  }


  formInitialized(name: string, form: FormGroup, value: Ubicacion) {
    this.clienteForm.setControl(name, form);
    const u = this.clienteForm.get(name);

    u.setValue({
      idLocalidad: value && value.idLocalidad ? value.idLocalidad : null,
      idProvincia: value && value.idProvincia ? value.idProvincia : null,
      calle: value && value.calle ? value.calle : '',
      numero: value && value.numero ? value.numero : '',
      piso: value && value.piso ? value.piso : '',
      departamento: value && value.departamento ? value.departamento : '',
      nombreProvincia: value && value.nombreProvincia ? value.nombreProvincia : '',
      nombreLocalidad: value && value.nombreLocalidad ? value.nombreLocalidad : '',
    });
  }


  getUbicacionFormValues(nombre: string, uOriginal: Ubicacion = null): any {
    const values = this.clienteForm.get(nombre).value;
    return {
      idUbicacion: uOriginal ? uOriginal.idUbicacion : null,
      descripcion: uOriginal ? uOriginal.descripcion : '',
      latitud: uOriginal ? uOriginal.latitud : null,
      longitud: uOriginal ? uOriginal.longitud : null,
      calle: values.calle,
      numero: values.numero,
      piso: values.piso,
      departamento: values.departamento,
      eliminada: uOriginal ? uOriginal.eliminada : null,
      idLocalidad: values.idLocalidad,
      nombreLocalidad: '',
      idProvincia: values.idProvincia,
      nombreProvincia: '',
    };
  }

  rebuildForm() {
    if (!this.cliente) {
      this.clienteForm.reset();
    } else {
      this.clienteForm.reset({
        idFiscal: this.cliente.idFiscal,
        nombreFiscal: this.cliente.nombreFiscal,
        nombreFantasia: this.cliente.nombreFantasia,
        categoriaIVA: this.cliente.categoriaIVA,
        telefono: this.cliente.telefono,
        contacto: this.cliente.contacto,
        email: this.cliente.email,
      });
    }
  }
}
