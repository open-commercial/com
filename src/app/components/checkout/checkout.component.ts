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
import {Subject} from 'rxjs';
import {debounceTime, filter, finalize, mergeAll} from 'rxjs/operators';
import {MatStepper} from '@angular/material';
import {Router} from '@angular/router';
import {LatLng, MapsAPILoader} from '@agm/core';
import {Ubicacion} from '../../models/ubicacion';
import {EmpresasService} from '../../services/empresas.service';
import {Empresa} from '../../models/empresa';

@Component({
  selector: 'sic-com-checkout',
  templateUrl: 'checkout.component.html',
  styleUrls: ['checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  isLoading = false;
  usuario: Usuario = null;

  checkoutPaso1Form: FormGroup = null;
  checkoutPaso2Form: FormGroup = null;
  checkoutPaso3Form: FormGroup = null;

  // cliente
  clienteDeUsuario: Cliente = null;
  cliente: Cliente = null;
  opcionCliente = '1';
  isClientesLoading = false;
  clientes = [];
  clientesPagina = 0;
  clientesTotalPaginas = 0;
  busqKeyUp = new Subject<string>();

  // envio
  opcionEnvio = '1';

  enviarADireccionFacturacion = true;

  sucursales: Empresa[] = [];

  cantidadArticulos: Number = 0;
  subTotal: Number = 0;
  total: Number = 0;
  loadingTotales = false;
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
              private empresasService: EmpresasService,
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

    this.getSucursales();
  }

  createForms() {
    this.checkoutPaso2Form = this.fb.group({
      'observaciones': ['', Validators.maxLength(this.observacionesMaxLength)]
    });
    this.checkoutPaso1Form = this.fb.group({
      'id_Cliente': [this.cliente.id_Cliente, Validators.required]
    });
    this.checkoutPaso3Form = this.fb.group({
      sucursal: null,
      opcionEnvio: ['', Validators.required],
    });
    this.checkoutPaso3Form.get('opcionEnvio').valueChanges.subscribe(value => {
      if (value === '1') {
        this.checkoutPaso3Form.removeControl('ubicacionEnvio');
      }
      if (value === '2') {
        this.checkoutPaso3Form.get('sucursal').setValue(null);
        this.checkoutPaso3Form.removeControl('ubicacionEnvio');
      }
      if (value === '3') {
        this.checkoutPaso3Form.get('sucursal').setValue(null);
      }
    });

    if (!this.puedeVenderAOtroCliente()) {
      setTimeout(() => {
        this.stepper.selectedIndex = 1;
        this.stepper._steps.first.editable = false;
      }, 300);
    }
  }

  formInitialized(name: string, form: FormGroup, value: Ubicacion) {
    this.checkoutPaso3Form.setControl(name, form);
    const u = this.checkoutPaso3Form.get(name);

    u.setValue({
      buscador: '',
      nombreLocalidad: value && value.nombreLocalidad ? value.nombreLocalidad : '',
      nombreProvincia: value && value.nombreProvincia ? value.nombreProvincia : '',
      codigoPostal: value && value.codigoPostal ? value.codigoPostal : '',
      calle: value && value.calle ? value.calle : '',
      numero: value && value.numero ? value.numero : '',
      piso: value && value.piso ? value.piso : '',
      departamento: value && value.departamento ? value.departamento : '',
    });
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
      this.getTotalesInfo();
    }
    this.clearClientes();
    if (this.busquedaInputRef) {
      this.busquedaInputRef.nativeElement.value = '';
    }
    this.checkoutPaso1Form.get('id_Cliente').setValue(this.cliente ? this.cliente.id_Cliente : null);
  }

  cargarClientes(search, reset: boolean) {
    this.isClientesLoading = true;
    if (reset) {
      this.clearClientes();
    }
    this.clientesService.getClientes(search, this.clientesPagina).pipe(
      finalize(() => this.isClientesLoading = false)
    ).subscribe(
      data => {
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
      this.carritoCompraService.getCarritoCompra(this.cliente.id_Cliente)
        .subscribe(data => {
          this.cantidadArticulos = data.cantArticulos;
          this.subTotal = data.subtotal;
          this.total = data.total;
          if (this.cantidadArticulos <= 0) {
            this.router.navigate(['carrito-compra']);
          }
        });
    }
  }

  getSucursales() {
    this.empresasService.getEmpresas()
      .pipe(
        // Este filter es por las dudas no venga la lat y/o la lng
        filter((data: Empresa[], i) => !!(data[i].ubicacion.latitud && data[i].ubicacion.longitud))
      )
      .subscribe((data: Empresa[]) => {
        this.sucursales = data;
      });
  }

  markerSucursalesClick(s: Empresa) {
    this.checkoutPaso3Form.get('sucursal').setValue(s);
  }

  getUbicacionStr(): string {
    const s = this.checkoutPaso3Form.get('sucursal').value;
    return s ? `${s.nombre} (${s.ubicacion.descripcion})` : '(no seleccionada)';
  }

  cerrarOrden() {
    if (this.cliente && this.checkoutPaso1Form.valid && this.checkoutPaso2Form.valid && this.checkoutPaso3Form.valid) {
      this.checkoutPaso1Form.disable();
      this.checkoutPaso2Form.disable();
      this.checkoutPaso3Form.disable();
      this.enviarOrdenLoading = true;
      this.carritoCompraService.enviarOrden(
        this.checkoutPaso2Form.get('observaciones').value, this.authService.getLoggedInIdUsuario(), this.cliente.id_Cliente
      ).subscribe(
        data => {
          const mensaje = 'El pedido Nro ' + data['nroPedido'] + ' fué generado correctamente';
          this.avisoService.openSnackBar(mensaje, '', 3500);
          this.router.navigateByUrl('/');
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.checkoutPaso1Form.enable();
          this.checkoutPaso2Form.enable();
          this.checkoutPaso3Form.enable();
          this.enviarOrdenLoading = false;
        }
      );
    }
  }

  changeStep($event) {
    if ($event.selectedIndex === 1) {
      setTimeout(() => this.observacionesTextAreaRef.nativeElement.focus(), 300);
    }
  }
}
