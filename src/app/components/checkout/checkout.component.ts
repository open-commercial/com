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
import {forkJoin, observable, Observable, Subject} from 'rxjs';
import {debounceTime, filter, finalize} from 'rxjs/operators';
import {MatStepper} from '@angular/material';
import {Router} from '@angular/router';
import {Ubicacion} from '../../models/ubicacion';
import {EmpresasService} from '../../services/empresas.service';
import {Empresa} from '../../models/empresa';
import {UbicacionService} from '../../services/ubicacion.service';
import {TipoDeEnvio} from '../../models/tipo-de-envio';

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
    { value: OpcionEnvio.DIRECCION_FACTURACION, text: 'Usar Dirección de Facturación' },
    { value: OpcionEnvio.DIRECCION_ENVIO, text: 'Usar Ubicación de Envío' },
  ];
  // enum OpcionEnvio para el template
  opcionEnvio = OpcionEnvio;
  sucursales: Empresa[] = [];
  sucursal: Empresa = null;
  ubicacionSucursal: Ubicacion = null;
  isUbicacionSucursalLoading = false;

  ubicacionFacturacion: Ubicacion = null;
  ubicacionEnvio: Ubicacion = null;
  isUbicacionesLoading = false;

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
              private ubicacionService: UbicacionService,
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
      'id_Cliente': [null, Validators.required]
    });

    this.datosDelClienteForm = this.fb.group({
      'continueStepValidator': ['whatever', Validators.required],
      'clienteUbicacionFacturacion': [ null, Validators.required ]
    });

    this.opcionEnvioForm = this.fb.group({
      sucursal: null,
      opcionEnvio: ['', Validators.required],
    });

    this.opcionEnvioForm.setValidators(sucursalValidator);

    this.opcionEnvioForm.get('opcionEnvio').valueChanges.subscribe(value => {
      if (value === OpcionEnvio.RETIRO_SUCURSAL) {
        this.opcionEnvioForm.removeControl('ubicacionEnvio');
      }
      if (value === OpcionEnvio.DIRECCION_FACTURACION) {
        this.opcionEnvioForm.get('sucursal').setValue(null);
        this.opcionEnvioForm.removeControl('ubicacionEnvio');
      }
      if (value === OpcionEnvio.DIRECCION_ENVIO) {
        this.opcionEnvioForm.get('sucursal').setValue(null);
      }
    });

    this.opcionEnvioForm.get('sucursal').valueChanges.subscribe((value: Empresa) => {
      this.asignarSucursal(value);
    });

    this.resumenForm = this.fb.group({
      'observaciones': ['', Validators.maxLength(this.observacionesMaxLength)]
    });
  }

  formInitialized(name: string, form: FormGroup, value: Ubicacion) {
    this.opcionEnvioForm.setControl(name, form);
    const u = this.opcionEnvioForm.get(name);

    u.setValue({
      nombreLocalidad: value && value.nombreLocalidad ? value.nombreLocalidad : '',
      nombreProvincia: value && value.nombreProvincia ? value.nombreProvincia : '',
      calle: value && value.calle ? value.calle : '',
      numero: value && value.numero ? value.numero : '',
      piso: value && value.piso ? value.piso : '',
      departamento: value && value.departamento ? value.departamento : '',
      idProvincia: value && value.idProvincia ? value.idProvincia : null,
      idLocalidad: value && value.idLocalidad ? value.idLocalidad : null,
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

  modeStatusChanged($event) {
    this.clienteEditionMode = $event;
    this.datosDelClienteForm.get('continueStepValidator').setValue($event ? null : 'whatever');
  }

  asignarCliente(newCliente: Cliente | null) {
    this.cliente = newCliente;
    this.ubicacionFacturacion = null;
    this.ubicacionEnvio = null;

    if (!this.cliente) {
      this.opcionClienteForm.get('id_Cliente').setValue(null);
      this.datosDelClienteForm.get('clienteUbicacionFacturacion').setValue(null);
      return;
    }

    this.opcionClienteForm.get('id_Cliente').setValue(this.cliente.id_Cliente);

    const uFacturacionObservable = this.cliente.idUbicacionFacturacion
      ? this.ubicacionService.getUbicacion(this.cliente.idUbicacionFacturacion) : null;
    const uEnvioObservable = this.cliente.idUbicacionEnvio
      ? this.ubicacionService.getUbicacion(this.cliente.idUbicacionEnvio) : null;

    if (!uFacturacionObservable && !uEnvioObservable) {
      return;
    }

    if (uFacturacionObservable && uEnvioObservable) {
      this.isUbicacionesLoading = true;
      forkJoin(uFacturacionObservable, uEnvioObservable)
        .pipe(finalize(() => this.isUbicacionesLoading = false))
        .subscribe(
          (data) => {
            this.ubicacionFacturacion = data[0];
            this.datosDelClienteForm.get('clienteUbicacionFacturacion').setValue(this.ubicacionFacturacion);
            this.ubicacionEnvio = data[1];
          },
          err => this.avisoService.openSnackBar(err.error, '', 3500)
        );
    } else {
      if (uFacturacionObservable) {
        this.isUbicacionesLoading = true;
        uFacturacionObservable
          .pipe(finalize(() => this.isUbicacionesLoading = false))
          .subscribe(
            (u: Ubicacion) => {
              this.ubicacionFacturacion = u;
              this.datosDelClienteForm.get('clienteUbicacionFacturacion').setValue(this.ubicacionFacturacion);
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      }
      if (uEnvioObservable) {
        this.isUbicacionesLoading = true;
        this.datosDelClienteForm.get('clienteUbicacionFacturacion').setValue(null);
        uEnvioObservable
          .pipe(finalize(() => this.isUbicacionesLoading = false))
          .subscribe(
            (u: Ubicacion) => {
              this.ubicacionEnvio = u;
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      }
    }

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
    this.ubicacionSucursal = null;

    if (!sucursal) { return; }

    if (this.sucursal.idUbicacion) {
      this.isUbicacionSucursalLoading = true;
      this.ubicacionService.getUbicacion(this.sucursal.idUbicacion)
        .pipe(finalize(() => this.isUbicacionSucursalLoading = false))
        .subscribe(
          (ubicacion: Ubicacion) => this.ubicacionSucursal = ubicacion,
          err => this.avisoService.openSnackBar(err.error, '', 3500)
        );
    }
  }

  getUbicacionStr(): string {
    return this.sucursal ? this.sucursal.detalleUbicacion : '(no seleccionada)';
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
      let uEnvio = null;
      let idSucursal = null;

      if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_SUCURSAL) {
        tipoDeEnvio = TipoDeEnvio.RETIRO_EN_SUCURSAL;
        idSucursal = dataEnvio.sucursal.id_Empresa;
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_FACTURACION) {
        tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_FACTURACION;
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_ENVIO) {
        tipoDeEnvio = TipoDeEnvio.USAR_UBICACION_ENVIO;
        uEnvio = dataEnvio.ubicacionEnvio;
        delete uEnvio.nombreLocalidad;
        delete uEnvio.nombreProvincia;

        if (this.ubicacionEnvio && this.ubicacionEnvio.idUbicacion) {
          uEnvio.idUbicacion = this.ubicacionEnvio.idUbicacion;
        } else {
          uEnvio.idUbicacion = null;
        }
      }

      this.opcionClienteForm.disable();
      this.resumenForm.disable();
      this.opcionEnvioForm.disable();
      this.enviarOrdenLoading = true;

      const cerrarOrdenObservable = this.carritoCompraService.enviarOrden(
        tipoDeEnvio, this.resumenForm.get('observaciones').value, idSucursal,
        this.authService.getLoggedInIdUsuario(), this.cliente.id_Cliente
      );

      if (uEnvio) {
        const ubicacionObservable: Observable<void|Ubicacion> = uEnvio.idUbicacion
          ? this.ubicacionService.updateUbicacion(uEnvio)
          : this.ubicacionService.createUbicacionEnvioCliente(this.cliente, uEnvio);
        ubicacionObservable.subscribe(
          u => {
            cerrarOrdenObservable.subscribe(
              data => this.cerrarOrdenNext(data),
              err => this.cerrarOrdenError(err)
            );
          },
          err => this.cerrarOrdenError(err)
        );
      } else {
        cerrarOrdenObservable.subscribe(
          data => this.cerrarOrdenNext(data),
          err => this.cerrarOrdenError(err)
        );
      }
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
        ret = this.cliente && this.cliente.idUbicacionFacturacion ? this.cliente.detalleUbicacionFacturacion : '';
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_ENVIO) {
        if (!this.opcionEnvioForm.get('ubicacionEnvio')) { return ''; }
        const ubicacionEnvio = this.opcionEnvioForm.get('ubicacionEnvio').value;
        ret = ubicacionEnvio
          ? ` ${ubicacionEnvio.calle} ${ubicacionEnvio.numero} ${ubicacionEnvio.nombreLocalidad}, ${ubicacionEnvio.nombreProvincia}`
          : '';
      }

      return ret;
    }
  }

  cerrarOrdenNext(data) {
    const mensaje = 'El pedido Nro ' + data['nroPedido'] + ' fué generado correctamente';
    this.avisoService.openSnackBar(mensaje, '', 3500);
    this.router.navigateByUrl('/');
  }

  cerrarOrdenError(err) {
    this.avisoService.openSnackBar(err.error, '', 3500);
    this.opcionClienteForm.enable();
    this.resumenForm.enable();
    this.opcionEnvioForm.enable();
    this.enviarOrdenLoading = false;
  }

  changeStep($event) {
    if ($event.selectedIndex !== 1) {
      this.clienteEditionMode = false;
    }

    if ($event.selectedIndex === 3) {
      setTimeout(() => this.observacionesTextAreaRef.nativeElement.focus(), 300);
    }
  }
}
