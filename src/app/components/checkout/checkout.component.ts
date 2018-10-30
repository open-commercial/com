import {Component, OnInit, ViewChild} from '@angular/core';
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
import {debounceTime, distinctUntilChanged, finalize, map} from 'rxjs/operators';
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
  cliente: Cliente = null;
  isClientesLoading = false;
  clientes = [];

  checkoutPaso1Form: FormGroup = null;
  checkoutPaso2Form: FormGroup = null;

  busqKeyUp = new Subject<string>();

  cantidadArticulos: Number = 0;
  subTotal: Number = 0;
  total: Number = 0;
  enviarOrdenLoading = false;

  @ViewChild('stepper') stepper: MatStepper;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private clientesService: ClientesService,
              private fb: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    const subscription = this.busqKeyUp.pipe(
        debounceTime(700),
        distinctUntilChanged()
      )
      .subscribe(
        search => {
          if ( search.length < 4 ) { this.clientes = []; return; }
          this.isClientesLoading = true;
          this.clientesService.getAllClientes(search).pipe(
            map(data => this.clientes = data.content),
            finalize(() => this.isClientesLoading = false)
          ).subscribe();
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
      'comentario': ''
    });

    this.checkoutPaso1Form = this.fb.group({
      'id_Cliente': [this.cliente.id_Cliente, Validators.required]
    });

    if (!this.puedeVenderAOtroCliente()) {
      this.checkoutPaso1Form.disable();
      setTimeout(() => {
        this.stepper.selectedIndex = 1; this.stepper._steps.first.editable = false;
      }, 300);
    }
  }

  puedeVenderAOtroCliente() {
    return this.cliente &&
      !(this.usuario && this.usuario.roles.indexOf(Rol[Rol.COMPRADOR.toString()]) !== -1 && this.usuario.roles.length === 1);
  }

  onBusqKeyUp($event) {
    this.busqKeyUp.next($event.target.value);
  }

  seleccionarCliente(cliente: Cliente) {
    this.cliente = cliente;
    if (this.checkoutPaso1Form) {
      this.checkoutPaso1Form.get('id_Cliente').setValue(this.cliente.id_Cliente);
      this.getTotalesInfo();
    }
    this.clientes = [];
    this.stepper.next();
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
      });
    }
  }

  cerrarOrden() {
    if (this.cliente) {
      this.checkoutPaso1Form.disable();
      this.checkoutPaso2Form.disable();
      this.enviarOrdenLoading = true;
      this.carritoCompraService.enviarOrden(
        this.checkoutPaso2Form.get('comentario').value, this.authService.getLoggedInIdUsuario(), this.cliente.id_Cliente
      ).subscribe(
        data => {
          this.avisoService.openSnackBar('PEDIDO REALIZACO CON ÉXITO.', '', 3500);
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

}
