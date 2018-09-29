import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {CategoriaIVA} from '../../models/categoriaIVA';
import {Pais} from '../../models/pais';
import {PaisesService} from '../../services/paises.service';
import {Provincia} from '../../models/provincia';
import {ProvinciasService} from '../../services/provincias.service';
import {Localidad} from '../../models/localidad';
import {LocalidadesService} from '../../services/localidades.service';
import {TipoDeCliente} from '../../models/tipo.cliente';

@Component({
  selector: 'sic-com-cliente',
  templateUrl: 'cliente.component.html',
  styleUrls: ['cliente.component.scss']
})
export class ClienteComponent implements OnInit {

  @Input() inEdition = false;
  clienteForm: FormGroup;
  cliente: Cliente = null;
  paises: Array<Pais> = [];
  provincias: Array<Provincia> = [];
  localidades: Array<Localidad> = [];
  isLoading = true;

  // Lo siguiente es para poder iterar sobre el enum de CategoriaIVA en la vista:
  // Se guarda el metodo keys de Object en una variable
  keys = Object.keys;
  // Asigno el enum a una variable
  categoriasIVA = CategoriaIVA;
  tiposDeCliente = TipoDeCliente;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private avisoService: AvisoService,
              private clientesService: ClientesService,
              private paisesService: PaisesService,
              private provinciasService: ProvinciasService,
              private localidadesService: LocalidadesService) {
    this.createForm();
  }

  createForm() {
    this.clienteForm = this.fb.group({
      tipoDeCliente: [null, Validators.required],
      idFiscal: ['', Validators.pattern('^[0-9]*$')],
      razonSocial: ['', Validators.required],
      nombreFantasia: '',
      categoriaIVA: [null, Validators.required],
      direccion: '',
      idPais: null,
      idProvincia: null,
      idLocalidad: null,
      telefono: ['', Validators.required],
      email: ['', Validators.email],
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
      (cliente: Cliente) => {
        if (cliente) {
          this.cliente = cliente;
          this.clienteForm.get('tipoDeCliente').disable();
        }
        this.isLoading = false;
      },
      error => this.isLoading = false
    );
    this.getPaises();
    this.clienteForm.get('idPais').valueChanges.subscribe(
      idPais => {
        this.getProvincias(idPais);
        this.clienteForm.get('idProvincia').setValue(null);
      }
    );
    this.clienteForm.get('idProvincia').valueChanges.subscribe(
      idProvincia => {
        this.getLocalidades(idProvincia);
        this.clienteForm.get('idLocalidad').setValue(null);
      }
    );
  }

  toggleEdit() {
    this.inEdition = !this.inEdition;
    this.rebuildForm();
  }

  submit() {
    if (this.clienteForm.valid) {
      const cliente = this.getFormValues();
      this.isLoading = true;
      this.clientesService.saveCliente(cliente).subscribe(
        data => {
          this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
            .subscribe(
              (newcliente: Cliente) => {
                if (cliente) {
                  this.cliente = newcliente;
                  this.inEdition = false;
                  this.clienteForm.get('tipoDeCliente').disable();
                }
                this.isLoading = false;
              }
            );
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
      tipoDeCliente: this.clienteForm.get('tipoDeCliente').value,
      id_Cliente: this.cliente ? this.cliente.id_Cliente : null,
      razonSocial: this.clienteForm.get('razonSocial').value,
      nombreFantasia: this.clienteForm.get('nombreFantasia').value,
      direccion: this.clienteForm.get('direccion').value,
      idFiscal: this.clienteForm.get('idFiscal').value,
      email: this.clienteForm.get('email').value,
      telefono: this.clienteForm.get('telefono').value,
      contacto: this.cliente ? this.cliente.contacto : '',
      idLocalidad: this.clienteForm.get('idLocalidad').value,
      categoriaIVA: this.clienteForm.get('categoriaIVA').value,
      idCredencial: this.authService.getLoggedInIdUsuario(),
      idViajante: this.cliente ? this.cliente.idViajante : null,
    };
  }

  rebuildForm() {
    if (!this.cliente) {
      this.clienteForm.reset();
    } else {
      this.clienteForm.reset({
        tipoDeCliente: this.cliente.tipoDeCliente,
        idFiscal: this.cliente.idFiscal,
        razonSocial: this.cliente.razonSocial,
        nombreFantasia: this.cliente.nombreFantasia,
        categoriaIVA: this.cliente.categoriaIVA,
        direccion: this.cliente.direccion,
        idPais: this.cliente.idPais,
        idProvincia: this.cliente.idProvincia,
        idLocalidad: this.cliente.idLocalidad,
        telefono: this.cliente.telefono,
        contacto: this.cliente.contacto,
        email: this.cliente.email
      });
    }
  }

  getPaises() {
    this.paisesService.getPaises()
      .subscribe((data: Pais[]) => {
        this.paises = data;
      });
  }

  getProvincias(idPais: number) {
    if (!idPais) {
      this.provincias.splice(0, this.provincias.length);
      this.localidades.splice(0, this.localidades.length);
      return;
    }
    this.provinciasService.getProvincias(idPais)
      .subscribe((data: Provincia[]) => {
        this.provincias = data;
      });
  }

  getLocalidades(idProvincia: number) {
    if (!idProvincia) {
      this.localidades.splice(0, this.localidades.length);
      return;
    }
    this.localidadesService.getLocalidades(idProvincia)
      .subscribe((data: Localidad[]) => this.localidades = data);
  }
}
