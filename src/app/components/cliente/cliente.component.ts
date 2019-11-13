import {Component, Input, OnChanges, SimpleChange, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {CategoriaIVA} from '../../models/categoria-iva';
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

  ngOnInit() {
    this.createForm();

    if (!this.c) {
      this.isLoading = true;
      this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(
          cliente => this.cliente = cliente,
          err => this.avisoService.openSnackBar(err.error, '', 3500)
        );
    }
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.c !== undefined) {
      this.cliente = changes.c.currentValue;
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
      const clienteFormValues = this.getFormValues();

      this.isLoading = true;
      this.clientesService.saveCliente(clienteFormValues)
        .subscribe((data) => {
          this.clientesService.getCliente(this.cliente.idCliente)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(cliente => {
                this.cliente = cliente;
                this.updated.emit(this.cliente);
                this.changeModeStatus(false);
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
      idCliente: this.cliente ? this.cliente.idCliente : null,
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
    }
  }
}
