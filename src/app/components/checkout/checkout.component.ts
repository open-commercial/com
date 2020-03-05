import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors} from '@angular/forms';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {ClientesService} from '../../services/clientes.service';
import {Usuario} from '../../models/usuario';
import {Cliente} from '../../models/cliente';
import {finalize} from 'rxjs/operators';
import { MatStepper } from '@angular/material/stepper';
import {Router} from '@angular/router';
import {Ubicacion} from '../../models/ubicacion';
import {SucursalesService} from '../../services/sucursales.service';
import {Sucursal} from '../../models/sucursal';
import {UbicacionesService} from '../../services/ubicaciones.service';
import {TipoDeEnvio} from '../../models/tipo-de-envio';
import {NuevaOrdenDeCompra} from '../../models/nueva-orden-de-compra';
import {NuevoPagoMercadoPago} from '../../models/mercadopago/nuevo-pago-mercado-pago';

enum OpcionEnvio {
  RETIRO_EN_SUCURSAL = 'RETIRO_EN_SUCURSAL',
  ENVIO_A_DOMICILIO = 'ENVIO_A_DOMICILIO',
}

enum OpcionEnvioUbicacion {
  USAR_UBICACION_ENVIO = 'USAR_UBICACION_ENVIO',
  USAR_UBICACION_FACTURACION = 'USAR_UBICACION_FACTURACION',
}

enum OpcionPago {
  PAGAR_AHORA = 'PAGAR_AHORA',
  PAGAR_LUEGO = 'PAGAR_LUEGO',
}

const sucursalValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const oe = control.get('opcionEnvio');
  const sucursal = control.get('sucursal');

  return oe && sucursal && oe.value === OpcionEnvio.RETIRO_EN_SUCURSAL && !sucursal.value ?
    { 'requiredSucursal': true } : null;
};

const opcionEnvioUbicacionValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const oe = control.get('opcionEnvio');
  const oeu = control.get('opcionEnvioUbicacion');

  return oe && oeu && oe.value === OpcionEnvio.ENVIO_A_DOMICILIO && !oeu.value ?
    { 'requiredOpcionEnvioUbicacion': true } : null;
};

@Component({
  selector: 'sic-com-checkout',
  templateUrl: 'checkout.component.html',
  styleUrls: ['checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  isLoading = false;
  usuario: Usuario = null;

  datosDelClienteForm: FormGroup = null;
  opcionEnvioForm: FormGroup = null;
  pagoForm: FormGroup = null;

  // Cliente
  cliente: Cliente = null;
  clienteEditionMode = false;

  // enum OpcionEnvio para el template
  opcionEnvio = OpcionEnvio;
  // enum OpcionEnvioUbicacion para el template
  opcionEnvioUbicacion = OpcionEnvioUbicacion;
  sucursales: Sucursal[] = [];
  sucursal: Sucursal = null;
  ubicacionSucursal: Ubicacion = null;
  isUbicacionSucursalLoading = false;

  ubicacionFacturacion: Ubicacion = null;
  ubicacionFacturacionUpdating = false;
  ubicacionFacturacionInEdition = false;

  ubicacionEnvio: Ubicacion = null;
  ubicacionEnvioUpdating = false;
  ubicacionEnvioInEdition = false;

  isUbicacionesLoading = false;

  cantidadArticulos = 0;
  total = 0;
  loadingTotales = false;
  enviarOrdenLoading = false;

  opcionPago = OpcionPago;

  @ViewChild('stepper', { static: false }) stepper: MatStepper;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private clientesService: ClientesService,
              private sucursalService: SucursalesService,
              private ubicacionesService: UbicacionesService,
              private fb: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    this.createForms();
    this.isLoading = true;
    this.authService.getLoggedInUsuario().subscribe(
      (usuario: Usuario) => {
        if (usuario) {
          this.usuario = usuario;
          this.clientesService.getClienteDelUsuario(this.usuario.idUsuario)
            .pipe(
              finalize(() => this.isLoading = false)
            )
            .subscribe(
              (cliente: Cliente) => this.asignarCliente(cliente),
              err => this.avisoService.openSnackBar(err.error, '', 3500)
            )
          ;
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
    this.datosDelClienteForm = this.fb.group({
      continueStepValidator: ['whatever', Validators.required],
    });

    this.opcionEnvioForm = this.fb.group({
      opcionEnvio: [null, Validators.required],
      sucursal: null,
      opcionEnvioUbicacion: null,
      continueStepValidator: [null, Validators.required],
    });

    this.opcionEnvioForm.setValidators([sucursalValidator, opcionEnvioUbicacionValidator]);

    this.opcionEnvioForm.get('opcionEnvio').valueChanges.subscribe((value: OpcionEnvio) => {
      if (value === OpcionEnvio.RETIRO_EN_SUCURSAL) {
        this.opcionEnvioForm.get('opcionEnvioUbicacion').setValue(null);
        this.opcionEnvioForm.get('opcionEnvioUbicacion').markAsUntouched();
        this.opcionEnvioForm.get('continueStepValidator').setValue('whatever');
        if (this.sucursales.length) { this.opcionEnvioForm.get('sucursal').setValue(this.sucursales[0]); }
      }
      if (value === OpcionEnvio.ENVIO_A_DOMICILIO) {
        this.opcionEnvioForm.get('sucursal').setValue(null);
        this.opcionEnvioForm.get('sucursal').markAsUntouched();
        this.opcionEnvioForm.get('continueStepValidator').setValue(null);
        this.opcionEnvioForm.get('opcionEnvioUbicacion').setValue(OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION);
      }
    });

    this.opcionEnvioForm.get('sucursal').valueChanges.subscribe((value: Sucursal) => {
      this.asignarSucursal(value);
      if (value) { this.opcionEnvioForm.get('continueStepValidator').setValue('whatever'); }
    });

    this.opcionEnvioForm.get('opcionEnvioUbicacion').valueChanges.subscribe((value: OpcionEnvioUbicacion) => {
      this.opcionEnvioForm.get('continueStepValidator').setValue(null);
      if (value === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION && this.ubicacionFacturacion) {
        this.opcionEnvioForm.get('continueStepValidator').setValue( 'whatever');
      }
      if (value === OpcionEnvioUbicacion.USAR_UBICACION_ENVIO && this.ubicacionEnvio) {
        this.opcionEnvioForm.get('continueStepValidator').setValue( 'whatever');
      }
    });

    this.pagoForm = this.fb.group({
      opcionPago: ['', Validators.required]
    });
  }

  clienteUpdated($event: Cliente) {
    this.asignarCliente($event);
  }

  modeStatusChanged(inEdition) {
    this.clienteEditionMode = inEdition;
    this.datosDelClienteForm.get('continueStepValidator').setValue(inEdition ? null : 'whatever');
  }

  asignarCliente(c: Cliente | null) {
    this.cliente = c;
    this.ubicacionFacturacion = c ? c.ubicacionFacturacion : null;
    this.ubicacionEnvio = c ? c.ubicacionEnvio : null;
    this.getTotalesInfo();
  }

  getSucursales() {
    this.sucursalService.getSucursalesConPuntoDeRetiro()
      .subscribe((data: Sucursal[]) => this.sucursales = data);
  }

  asignarSucursal(sucursal: Sucursal) {
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
          this.clientesService.getCliente(this.cliente.idCliente)
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
          this.clientesService.getCliente(this.cliente.idCliente)
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
    const oe = this.opcionEnvioForm.get('opcionEnvio').value;
    const oeu = this.opcionEnvioForm.get('opcionEnvioUbicacion').value;

    ret = ret && (
      (oe === OpcionEnvio.RETIRO_EN_SUCURSAL && this.opcionEnvioForm.get('sucursal').value) ||
      (oe === OpcionEnvio.ENVIO_A_DOMICILIO &&
        (oeu === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION && this.ubicacionFacturacion &&
          !this.ubicacionFacturacionInEdition && !this.ubicacionFacturacionUpdating) ||
        (oeu === OpcionEnvioUbicacion.USAR_UBICACION_ENVIO && this.ubicacionEnvio &&
          !this.ubicacionEnvioInEdition && !this.ubicacionEnvioUpdating)
      )
    );

    return ret;
  }

  getTotalesInfo() {
    if (this.cliente) {
      this.carritoCompraService.getCarritoCompra(this.cliente.idCliente)
        .subscribe(data => {
          if (data.total < this.cliente.montoCompraMinima) {
            this.router.navigate(['carrito-compra']);
          }
          this.cantidadArticulos = data.cantArticulos;
          this.total = data.total;
          if (this.cantidadArticulos <= 0) {
            this.router.navigate(['carrito-compra']);
          }
        })
      ;
    }
  }

  cerrarOrden() {
    this.pagoForm.get('opcionPago').setValue(OpcionPago.PAGAR_LUEGO);
    if (
      this.cliente && this.datosDelClienteForm.valid &&
      this.pagoForm.valid && this.opcionEnvioForm.valid
    ) {
      const dataEnvio = this.opcionEnvioForm.value;

      let tipoDeEnvio = null;
      let idSucursal = null;

      if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_EN_SUCURSAL) {
        tipoDeEnvio = TipoDeEnvio.RETIRO_EN_SUCURSAL;
        idSucursal = dataEnvio.sucursal.idSucursal;
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.ENVIO_A_DOMICILIO) {
        if (dataEnvio.opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION) {
          tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_FACTURACION;
        }
        if (dataEnvio.opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_ENVIO) {
          tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_ENVIO;
        }
      }

      this.enviarOrdenLoading = true;

      const orden: NuevaOrdenDeCompra = {
        idSucursal: idSucursal,
        tipoDeEnvio: tipoDeEnvio
      };

      this.carritoCompraService.enviarOrden(orden)
        .pipe(finalize(() => {
          this.enviarOrdenLoading = false;
        }))
        .subscribe(
        () => this.router.navigateByUrl('/checkout/aprobado'),
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
    }
  }

  getTipoEnvio(): TipoDeEnvio {
    const dataEnvio = this.opcionEnvioForm.value;
    let tipoDeEnvio = null;

    if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_EN_SUCURSAL) {
      tipoDeEnvio = TipoDeEnvio.RETIRO_EN_SUCURSAL;
    }

    if (dataEnvio.opcionEnvio === OpcionEnvio.ENVIO_A_DOMICILIO) {
      if (dataEnvio.opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION) {
        tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_FACTURACION;
      }
      if (dataEnvio.opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_ENVIO) {
        tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_ENVIO;
      }
    }

    return tipoDeEnvio;
  }

  updated(pago: NuevoPagoMercadoPago) {
    if (pago) { this.cerrarOrden(pago); }
  }

  getEnvioLabel() {
    const dataEnvio = this.opcionEnvioForm.value;
    let ret = '';
    if (dataEnvio) {
      if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_EN_SUCURSAL) {
        ret = dataEnvio.sucursal
          ? `Retiro en Sucursal: ${dataEnvio.sucursal.nombre}`
            + (dataEnvio.sucursal.detalleUbicacion ? ` (${dataEnvio.sucursal.detalleUbicacion})` : '')
          : ''
        ;
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.ENVIO_A_DOMICILIO) {
        if (dataEnvio.opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION) {
          ret = this.getUbicacionStr(this.ubicacionFacturacion);
        }
        if (dataEnvio.opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_ENVIO) {
          ret = this.getUbicacionStr(this.ubicacionEnvio);
        }
      }
    }
    return ret;
  }

  irAlCarrito() {
    this.router.navigate(['/carrito-compra']);
  }
}
