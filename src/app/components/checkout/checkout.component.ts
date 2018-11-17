import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {ClientesService} from '../../services/clientes.service';
import {Usuario} from '../../models/usuario';
import {Cliente} from '../../models/cliente';
import {Rol} from '../../models/rol';
import {forkJoin, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, finalize} from 'rxjs/operators';
import {MatStepper} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'sic-com-checkout',
  templateUrl: 'checkout.component.html',
  styleUrls: ['checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  isLoading = false;
  usuario: Usuario = null;
  clienteDeUsuario: Cliente = null;
  cliente: Cliente = null;

  opcionCliente = '1';
  isClientesLoading = false;
  clientes = [];
  clientesPagina = 0;
  clientesTamanioPagina = 3;
  clientesTotalPaginas = 0;

  checkoutPaso1Form: FormGroup = null;
  checkoutPaso2Form: FormGroup = null;

  busqKeyUp = new Subject<string>();

  cantidadArticulos: Number = 0;
  subTotal: Number = 0;
  total: Number = 0;
  enviarOrdenLoading = false;

  @ViewChild('stepper')
  stepper: MatStepper;

  @ViewChild('busquedaInput')
  busquedaInputRef: ElementRef;

  @ViewChild('observacionesTextArea')
  observacionesTextAreaRef: ElementRef;

  observacionesMaxLength = 200;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private clientesService: ClientesService,
              private fb: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    this.busqKeyUp.pipe(
      debounceTime(700),
    ).subscribe(
      search => {
        if (search.length < 1) {
          this.clearClientes();
          return;
        }
        this.cargarClientes(search, true);
      }
    );
    this.isLoading = true;
    this.authService.getLoggedInUsuario().subscribe(
      (usuario: Usuario) => {
        if (usuario) {
          this.usuario = usuario;
          this.clientesService.getClienteDelUsuario(this.usuario.id_Usuario).subscribe(
            (cliente: Cliente) => {
              if (cliente) {
                this.clienteDeUsuario = cliente;
                this.cliente = cliente;
                this.createForms();
                this.getTotalesInfo();
              }
              this.isLoading = false;
            },
            err => {
              this.isLoading = false;
              this.avisoService.openSnackBar(err.error, '', 3500);
            }
          );
        } else {
          this.isLoading = false;
        }
      },
      err => {
        this.isLoading = false;
        this.avisoService.openSnackBar(err.error, '', 3500);
      }
    );
  }

  createForms() {
    this.checkoutPaso2Form = this.fb.group({
      'observaciones': ['', Validators.maxLength(this.observacionesMaxLength)]
    });
    this.checkoutPaso1Form = this.fb.group({
      'id_Cliente': [this.cliente.id_Cliente, Validators.required]
    });
    if (!this.puedeVenderAOtroCliente()) {
      setTimeout(() => {
        this.stepper.selectedIndex = 1;
        this.stepper._steps.first.editable = false;
      }, 300);
    }
  }

  puedeVenderAOtroCliente() {
    return this.usuario &&
      !(this.usuario && this.usuario.roles.indexOf(Rol[Rol.COMPRADOR.toString()]) !== -1 && this.usuario.roles.length === 1);
  }

  onBusqKeyUp($event) {
    this.busqKeyUp.next($event.target.value);
  }

  clearClientes() {
    this.clientes = [];
    this.clientesPagina = 0;
  }

  opcionClienteChange($event) {
    this.opcionCliente = $event.value;
    if (this.opcionCliente === '2') {
      this.cliente = null;
      setTimeout(() => this.busquedaInputRef.nativeElement.focus(), 300);
    } else {
      this.cliente = this.clienteDeUsuario;
    }
    this.clearClientes();
    if (this.busquedaInputRef) {
      this.busquedaInputRef.nativeElement.value = '';
    }
    this.checkoutPaso1Form.get('id_Cliente').setValue(this.cliente ? this.cliente.id_Cliente : null);
  }

  cargarClientes(search, reset: boolean) {
    this.isClientesLoading = true;
    this.clientesService.getClientes(search, this.clientesPagina, this.clientesTamanioPagina).pipe(
      finalize(() => this.isClientesLoading = false)
    ).subscribe(
      data => {
        if (reset) {
          this.clearClientes();
        }
        data['content'].forEach(c => this.clientes.push(c));
        this.clientesTotalPaginas = data['totalPages'];
      }
    );
  }

  masClientes(search) {
    this.clientesPagina += 1;
    this.cargarClientes(search, false);
  }

  seleccionarCliente(cliente: Cliente) {
    this.cliente = cliente;
    if (this.checkoutPaso1Form) {
      this.checkoutPaso1Form.get('id_Cliente').setValue(this.cliente.id_Cliente);
      this.getTotalesInfo();
    }
    const mensaje = 'Se seleccionó el cliente: ' + this.cliente.nombreFiscal;
    this.avisoService.openSnackBar(mensaje, '', 3500);
  }

  getTotalesInfo() {
    if (this.cliente) {
      forkJoin(
        this.carritoCompraService.getCantidadArticulos(),
        this.carritoCompraService.getSubtotalImportePedido(),
        this.carritoCompraService.getTotalImportePedido(this.cliente.id_Cliente)
      ).subscribe(data => {
        this.cantidadArticulos = data[0];
        this.subTotal = data[1];
        this.total = data[2];
        if (this.cantidadArticulos <= 0) {
          this.router.navigate(['carrito-compra']);
        }
      });
    }
  }

  cerrarOrden() {
    if (this.cliente && this.checkoutPaso1Form.valid && this.checkoutPaso2Form.valid) {
      this.checkoutPaso1Form.disable();
      this.checkoutPaso2Form.disable();
      this.enviarOrdenLoading = true;
      this.carritoCompraService.enviarOrden(
        this.checkoutPaso2Form.get('observaciones').value, this.authService.getLoggedInIdUsuario(), this.cliente.id_Cliente
      ).subscribe(
        data => {
          const mensaje = 'El pedido Nro ' + data['nroPedido'] + ' fué generado correctamente';
          this.avisoService.openSnackBar(mensaje, '', 3500);
          this.irAProductos();
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.checkoutPaso1Form.enable();
          this.checkoutPaso2Form.enable();
          this.enviarOrdenLoading = false;
        }
      );
    }
  }

  irAProductos() {
    this.router.navigateByUrl('/productos;busqueda=' + this.productosService.getBusquedaCriteria());
  }

  changeStep($event) {
    if ($event.selectedIndex === 1) {
      setTimeout(() => this.observacionesTextAreaRef.nativeElement.focus(), 300);
    }
  }
}
