import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {CategoriaIVA} from '../../models/categoria-iva';
import {Pais} from '../../models/pais';
import {PaisesService} from '../../services/paises.service';
import {Provincia} from '../../models/provincia';
import {ProvinciasService} from '../../services/provincias.service';
import {Localidad} from '../../models/localidad';
import {LocalidadesService} from '../../services/localidades.service';

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
      idFiscal: ['', Validators.pattern('^[0-9]*$')],
      nombreFiscal: ['', Validators.required],
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
    this.getPaises();
    this.clienteForm.get('idPais').valueChanges.subscribe(
      idPais => {
        if (!idPais) {
          this.provincias.splice(0, this.provincias.length);
          this.localidades.splice(0, this.localidades.length);
          this.clienteForm.get('idProvincia').setValue(null);
          return;
        }
        this.provinciasService.getProvincias(idPais).subscribe(
          (data: Provincia[]) => {
            this.provincias = data;
            const provinciaFormValue = this.clienteForm.get('idProvincia').value;
            if (!this.provinciasHasId(provinciaFormValue)) {
              const idPorvincia = this.provincias.length ? this.provincias[0].id_Provincia : null;
              this.clienteForm.get('idProvincia').setValue(idPorvincia);
            }
          }
        );
      }
    );
    this.clienteForm.get('idProvincia').valueChanges.subscribe(
      idProvincia => {
        if (!idProvincia) {
          this.localidades.splice(0, this.localidades.length);
          this.clienteForm.get('idLocalidad').setValue(null);
          return;
        }
        this.localidadesService.getLocalidades(idProvincia).subscribe(
          (data: Localidad[]) => {
            this.localidades = data;
            const localidadFormValue = this.clienteForm.get('idLocalidad').value;
            if (!this.localidadHasId(localidadFormValue)) {
              const idLocalidad = this.localidades.length ? this.localidades[0].id_Localidad : null;
              this.clienteForm.get('idLocalidad').setValue(idLocalidad);
            }
          }
        );
      }
    );
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
      (cliente: Cliente) => {
        if (cliente) {
          this.cliente = cliente;
        }
        this.isLoading = false;
      },
      error => this.isLoading = false
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
      id_Cliente: this.cliente ? this.cliente.id_Cliente : null,
      nombreFiscal: this.clienteForm.get('nombreFiscal').value,
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
        idFiscal: this.cliente.idFiscal,
        nombreFiscal: this.cliente.nombreFiscal,
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

  provinciasHasId(idProvincia) {
    for (let i = 0; i < this.provincias.length; i += 1) {
      if (this.provincias[i].id_Provincia === idProvincia) {
        return true;
      }
    }
    return false;
  }

  localidadHasId(idLocalidad) {
    for (let i = 0; i < this.localidades.length; i += 1) {
      if (this.localidades[i].id_Localidad === idLocalidad) {
        return true;
      }
    }
    return false;
  }
}
