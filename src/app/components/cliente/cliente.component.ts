import {Component, Input, OnChanges, SimpleChange, OnInit} from '@angular/core';
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
import {Ubicacion} from '../../models/ubicacion';

@Component({
  selector: 'sic-com-cliente',
  templateUrl: 'cliente.component.html',
  styleUrls: ['cliente.component.scss']
})
export class ClienteComponent implements OnInit, OnChanges {

  @Input() c: Cliente;
  inEdition = false;
  clienteForm: FormGroup;
  cliente: Cliente = null;
  isLoading = true;

  // Lo siguiente es para poder iterar sobre el enum de CategoriaIVA en la vista:
  // Se guarda el metodo keys de Object en una variable
  keys = Object.keys;
  // Asigno el enum a una variable
  categoriasIVA = CategoriaIVA;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private avisoService: AvisoService,
              private clientesService: ClientesService) {
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

  formInitialized(name: string, form: FormGroup, value: Ubicacion) {
    this.clienteForm.setControl(name, form);
    console.log(value);
    this.clienteForm.get(name).setValue({
      nombreLocalidad: value && value.nombreLocalidad ? value.nombreLocalidad : '',
      nombreProvincia: value && value.nombreProvincia ? value.nombreProvincia : '',
      codigoPostal: value && value.codigoPostal ? value.codigoPostal : '',
      calle: value && value.calle ? value.calle : '',
      numero: value && value.numero ? value.numero : '',
      piso: value && value.piso ? value.piso : '',
      departamento: value && value.departamento ? value.departamento : '',
    });
  }

  ngOnInit() {
    this.createForm();
    this.isLoading = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
      (cliente: Cliente) => {
        console.log(cliente);
        if (cliente) {
          this.cliente = cliente;
        }
        this.isLoading = false;
      },
      error => this.isLoading = false
    );
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.c.currentValue) {
      this.cliente = changes.c.currentValue;
    }
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
      idFiscal: this.clienteForm.get('idFiscal').value,
      email: this.clienteForm.get('email').value,
      telefono: this.clienteForm.get('telefono').value,
      contacto: this.cliente ? this.cliente.contacto : '',
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
        telefono: this.cliente.telefono,
        contacto: this.cliente.contacto,
        email: this.cliente.email,
      });

      console.log(this.clienteForm.contains('ubicacionFacturacion'));
      const uf = this.clienteForm.get('ubicacionFacturacion');
      //console.log(uf);
      /*if (uf) {
        uf.setValue({
          nombreLocalidad: this.cliente.ubicacionFacturacion.nombreLocalidad,
          nombreProvincia: this.cliente.ubicacionFacturacion.nombreProvincia,
          codigoPostal: this.cliente.ubicacionFacturacion.codigoPostal,
          calle: this.cliente.ubicacionFacturacion.calle,
          numero: this.cliente.ubicacionFacturacion.numero,
          piso: this.cliente.ubicacionFacturacion.piso,
          departamento: this.cliente.ubicacionFacturacion.departamento,
        });
      }*/
    }
  }
}
