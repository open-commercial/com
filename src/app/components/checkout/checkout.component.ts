import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors} from '@angular/forms';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {ClientesService} from '../../services/clientes.service';
import {Usuario} from '../../models/usuario';
import {Cliente} from '../../models/cliente';
import {Rol} from '../../models/rol';
import {Subject} from 'rxjs';
import {debounceTime, finalize} from 'rxjs/operators';
import { MatStepper } from '@angular/material/stepper';
import {Router} from '@angular/router';
import {Ubicacion} from '../../models/ubicacion';
import {EmpresasService} from '../../services/empresas.service';
import {Empresa} from '../../models/empresa';
import {UbicacionesService} from '../../services/ubicaciones.service';
import {TipoDeEnvio} from '../../models/tipo-de-envio';
import {NuevaOrdenDeCarritoCompra} from '../../models/nuevaOrdenDeCarritoCompra';

enum OpcionCliente {
  CLIENTE_USUARIO = '1',
  OTRO_CLIENTE = '2',
}

enum OpcionEnvio {
  RETIRO_SUCURSAL = '1',
  DIRECCION_FACTURACION = '2',
  DIRECCION_ENVIO = '3',
}

const sucursalValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const opcionEnvio = control.get('opcionEnvio');
  const sucursal = control.get('sucursal');

  return opcionEnvio && sucursal && opcionEnvio.value === OpcionEnvio.RETIRO_SUCURSAL && !sucursal.value ?
    { 'requiredSucursal': true } : null;
};

@Component({
  selector: 'sic-com-checkout',
  templateUrl: 'checkout.component.html',
  styleUrls: ['checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  isLoading = false;
  usuario: Usuario = null;

  opcionClienteForm: FormGroup = null;
  datosDelClienteForm: FormGroup = null;
  opcionEnvioForm: FormGroup = null;
  resumenForm: FormGroup = null;

  // Cliente
  opcionesCliente = [
    { value: OpcionCliente.CLIENTE_USUARIO, text: 'Mi Cuenta de Cliente' },
    { value: OpcionCliente.OTRO_CLIENTE, text: 'Buscar Cliente' },
  ];
  opcionClienteSeleccionada = OpcionCliente.CLIENTE_USUARIO;
  // enum OpcionCliente para el template
  opcionCliente = OpcionCliente;

  clienteDeUsuario: Cliente = null;
  cliente: Cliente = null;
  isClientesLoading = false;
  clientes = [];
  clientesPagina = 0;
  clientesTotalPaginas = 0;
  busqKeyUp = new Subject<string>();
  clienteEditionMode = false;

  // Envio
  opcionesEnvio = [
    { value: OpcionEnvio.RETIRO_SUCURSAL, text: 'Retiro en sucursal' },
    { value: OpcionEnvio.DIRECCION_FACTURACION, text: 'Usar Ubicación de Facturación' },
    { value: OpcionEnvio.DIRECCION_ENVIO, text: 'Usar Ubicación de Envío' },
  ];
  // enum OpcionEnvio para el template
  opcionEnvio = OpcionEnvio;
  sucursales: Empresa[] = [];
  sucursal: Empresa = null;
  ubicacionSucursal: Ubicacion = null;
  isUbicacionSucursalLoading = false;

  ubicacionFacturacion: Ubicacion = null;
  ubicacionFacturacionUpdating = false;
  ubicacionFacturacionInEdition = false;

  ubicacionEnvio: Ubicacion = null;
  ubicacionEnvioUpdating = false;
  ubicacionEnvioInEdition = false;

  isUbicacionesLoading = false;

  cantidadArticulos: Number = 0;
  subTotal: Number = 0;
  total: Number = 0;
  loadingTotales = false;
  enviarOrdenLoading = false;

  @ViewChild('stepper', { static: false })
  stepper: MatStepper;

  @ViewChild('busquedaInput', { static: false })
  busquedaInputRef: ElementRef;

  @ViewChild('observacionesTextArea', { static: false })
  observacionesTextAreaRef: ElementRef;
  observacionesMaxLength = 200;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private clientesService: ClientesService,
              private empresasService: EmpresasService,
              private ubicacionesService: UbicacionesService,
              private fb: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    this.createForms();
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
          this.clientesService.getClienteDelUsuario(this.usuario.id_Usuario)
            .pipe(
              finalize(() => {
                if (!this.puedeVenderAOtroCliente()) {
                  setTimeout(() => {
                    this.stepper.selectedIndex = 1;
                    this.stepper._steps.first.editable = false;
                  }, 300);
                }
              })
            )
            .subscribe(
            (cliente: Cliente) => {
              if (cliente) {
                this.clienteDeUsuario = cliente;
                this.asignarCliente(cliente);
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
    this.opcionClienteForm = this.fb.group({
      id_Cliente: [null, Validators.required]
    });

    this.datosDelClienteForm = this.fb.group({
      continueStepValidator: ['whatever', Validators.required],
    });

    this.opcionEnvioForm = this.fb.group({
      sucursal: null,
      opcionEnvio: ['', Validators.required],
      continueStepValidator: [null, Validators.required],
    });

    this.opcionEnvioForm.setValidators(sucursalValidator);

    this.opcionEnvioForm.get('opcionEnvio').valueChanges.subscribe(value => {
      if (value === OpcionEnvio.RETIRO_SUCURSAL) {
        this.opcionEnvioForm.removeControl('ubicacionEnvio');
        this.opcionEnvioForm.get('continueStepValidator').setValue('whatever');
      }
      if (value === OpcionEnvio.DIRECCION_FACTURACION) {
        this.opcionEnvioForm.get('sucursal').setValue(null);
        this.opcionEnvioForm.get('sucursal').markAsUntouched();
        this.opcionEnvioForm.removeControl('ubicacionEnvio');
        this.opcionEnvioForm.get('continueStepValidator').setValue(this.ubicacionFacturacion ? 'whatever' : null);
      }
      if (value === OpcionEnvio.DIRECCION_ENVIO) {
        this.opcionEnvioForm.get('sucursal').setValue(null);
        this.opcionEnvioForm.get('sucursal').markAsUntouched();
        this.opcionEnvioForm.get('continueStepValidator').setValue(this.ubicacionEnvio ? 'whatever' : null);
      }
    });

    this.opcionEnvioForm.get('sucursal').valueChanges.subscribe((value: Empresa) => {
      this.asignarSucursal(value);
    });

    this.opcionEnvioForm.get('opcionEnvio').setValue(OpcionEnvio.RETIRO_SUCURSAL);

    this.resumenForm = this.fb.group({
      'observaciones': ['', Validators.maxLength(this.observacionesMaxLength)]
    });
  }

  puedeVenderAOtroCliente() {
    return this.usuario &&
      !(this.usuario.roles.indexOf(Rol[Rol.COMPRADOR.toString()]) !== -1 && this.usuario.roles.length === 1);
  }

  onBusqKeyUp($event) {
    this.busqKeyUp.next($event.target.value);
  }

  clearClientes() {
    this.clientes = [];
    this.clientesPagina = 0;
  }

  opcionClienteChange($event) {
    this.opcionClienteSeleccionada = $event.value;
    if (this.opcionClienteSeleccionada === OpcionCliente.OTRO_CLIENTE) {
      this.asignarCliente(null);
      setTimeout(() => this.busquedaInputRef.nativeElement.focus(), 300);
    } else {
      this.asignarCliente(this.clienteDeUsuario);
    }
    this.clearClientes();
    if (this.busquedaInputRef) {
      this.busquedaInputRef.nativeElement.value = '';
    }
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
    this.asignarCliente(cliente);
    const mensaje = 'Se seleccionó el cliente: ' + this.cliente.nombreFiscal;
    this.avisoService.openSnackBar(mensaje, '', 3500);
  }

  clienteUpdated($event: Cliente) {
    this.asignarCliente($event);
  }

  modeStatusChanged(inEdition) {
    this.clienteEditionMode = inEdition;
    this.datosDelClienteForm.get('continueStepValidator').setValue(inEdition ? null : 'whatever');
  }

  asignarCliente(newCliente: Cliente | null) {
    this.cliente = newCliente;
    this.ubicacionFacturacion = newCliente ? newCliente.ubicacionFacturacion : null;
    this.ubicacionEnvio = newCliente ? newCliente.ubicacionEnvio : null;

    if (!this.cliente) {
      this.opcionClienteForm.get('id_Cliente').setValue(null);
      return;
    }

    this.opcionClienteForm.get('id_Cliente').setValue(this.cliente.id_Cliente);
    this.getTotalesInfo();
  }

  getSucursales() {
    this.empresasService.getEmpresas()
      .subscribe((data: Empresa[]) => {
        this.sucursales = data;
      });
  }

  asignarSucursal(sucursal: Empresa) {
    this.sucursal = sucursal;
    this.ubicacionSucursal = this.sucursal ? this.sucursal.ubicacion : null;
  }

  getUbicacionSucursalStr(): string {
    return this.sucursal ? this.sucursal.detalleUbicacion : '(no seleccionada)';
  }

  getUbicacionStr(u: Ubicacion) {
    const str = [];
    if (u) {
      str.push(u.calle ? u.calle : '');
      str.push(u.numero ? u.numero : '');
      str.push(u.piso ? u.piso : '');
      str.push(u.departamento ? u.departamento : '');
      str.push(u.nombreLocalidad + ' ' + u.nombreProvincia);
    }

    return str.join(' ');
  }

  ubicacionFacturacionUpdated(ubicacion: Ubicacion) {
    this.ubicacionFacturacionUpdating = true;
    this.cliente.ubicacionFacturacion = ubicacion;
    this.clientesService.saveCliente(this.cliente)
      .subscribe(
        () => {
          this.clientesService.getCliente(this.cliente.id_Cliente)
            .pipe(finalize(() => this.ubicacionFacturacionUpdating = false))
            .subscribe(
              (c: Cliente) => {
              this.ubicacionFacturacion = c.ubicacionFacturacion;
              this.ubicacionFacturacionInEdition = false;
              this.opcionEnvioForm.get('continueStepValidator').setValue('whatever');
            });
        },
        err => {
          this.ubicacionFacturacionUpdating = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }

  ubicacionEnvioUpdated(ubicacion: Ubicacion) {
    this.ubicacionEnvioUpdating = true;

    this.cliente.ubicacionEnvio = ubicacion;
    this.clientesService.saveCliente(this.cliente)
      .subscribe(
        () => {
          this.clientesService.getCliente(this.cliente.id_Cliente)
            .pipe(finalize(() => this.ubicacionEnvioUpdating = false))
            .subscribe((c: Cliente) => {
              this.ubicacionEnvio = c.ubicacionEnvio;
              this.ubicacionEnvioInEdition = false;
              this.opcionEnvioForm.get('continueStepValidator').setValue('whatever');
            });
        },
        err => {
          this.ubicacionEnvioUpdating = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }

  ufEditionStateChange(inEdition: boolean) {
    this.ubicacionFacturacionInEdition = inEdition;
    this.opcionEnvioForm.get('continueStepValidator').setValue((inEdition || !this.ubicacionFacturacion) ? null : 'whatever');
  }

  ueEditionStateChange(inEdition: boolean) {
    this.ubicacionEnvioInEdition = inEdition;
    this.opcionEnvioForm.get('continueStepValidator').setValue((inEdition || !this.ubicacionEnvio) ? null : 'whatever');
  }

  envioValidToContinueNextStep() {
    let ret = this.cliente && this.opcionEnvioForm.valid;
    const opcionEnvio = this.opcionEnvioForm.get('opcionEnvio').value;

    ret = ret && (
      (opcionEnvio === OpcionEnvio.RETIRO_SUCURSAL && this.opcionEnvioForm.get('sucursal').value) ||
      (opcionEnvio === OpcionEnvio.DIRECCION_FACTURACION && this.ubicacionFacturacion && !this.ubicacionFacturacionInEdition) ||
      (opcionEnvio === OpcionEnvio.DIRECCION_ENVIO && this.ubicacionEnvio && !this.ubicacionEnvioInEdition)
    );

    return ret;
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

  cerrarOrden() {
    if (
      this.cliente && this.opcionClienteForm.valid && this.datosDelClienteForm.valid &&
      this.resumenForm.valid && this.opcionEnvioForm.valid
    ) {
      const dataEnvio = this.opcionEnvioForm.value;

      let tipoDeEnvio = null;
      let idSucursal = null;

      if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_SUCURSAL) {
        tipoDeEnvio = TipoDeEnvio.RETIRO_EN_SUCURSAL;
        idSucursal = dataEnvio.sucursal.idEmpresa;
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_FACTURACION) {
        tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_FACTURACION;
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_ENVIO) {
        tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_ENVIO;
      }

      this.opcionClienteForm.disable();
      this.resumenForm.disable();
      this.opcionEnvioForm.disable();
      this.enviarOrdenLoading = true;

      const orden: NuevaOrdenDeCarritoCompra = {
        idSucursal: idSucursal,
        idCliente: this.cliente.id_Cliente,
        idUsuario: this.authService.getLoggedInIdUsuario(),
        tipoDeEnvio: tipoDeEnvio,
        observaciones : this.resumenForm.get('observaciones').value,
        idEmpresa: null
      };

      this.carritoCompraService.enviarOrden(orden)
        .pipe(finalize(() => this.enviarOrdenLoading = false))
        .subscribe(
        data => {
          const mensaje = 'El pedido Nro ' + data['nroPedido'] + ' fué generado correctamente';
          this.avisoService.openSnackBar(mensaje, '', 3500);
          this.router.navigateByUrl('/');
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.opcionClienteForm.enable();
          this.resumenForm.enable();
          this.opcionEnvioForm.enable();
        }
      );
    }
  }

  getEnvioLabel() {
    const dataEnvio = this.opcionEnvioForm.value;
    let ret = '';
    if (dataEnvio) {
      if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_SUCURSAL) {
        ret = dataEnvio.sucursal
          ? `Retiro en Sucursal: ${dataEnvio.sucursal.nombre}`
            + (dataEnvio.sucursal.detalleUbicacion ? ` (${dataEnvio.sucursal.detalleUbicacion})` : '')
          : ''
        ;
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_FACTURACION) {
        ret = this.getUbicacionStr(this.ubicacionFacturacion);
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_ENVIO) {
        ret = this.getUbicacionStr(this.ubicacionEnvio);
      }
    }
    return ret;
  }

  changeStep($event) {
    if ($event.selectedIndex !== 1) {
      this.clienteEditionMode = false;
    }

    if ($event.selectedIndex === 3) {
      setTimeout(() => this.observacionesTextAreaRef.nativeElement.focus(), 300);
    }
  }

  irAlCarrito() {
    this.router.navigate(['/carrito-compra']);
  }
}
