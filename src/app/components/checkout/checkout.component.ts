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
  checkoutPaso1_5Form: FormGroup = null;
  checkoutPaso2Form: FormGroup = null;
  checkoutPaso3Form: FormGroup = null;

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

  asignarCliente(newCliente: Cliente | null) {
    this.cliente = newCliente;
    this.ubicacionFacturacion = null;
    this.ubicacionEnvio = null;

    if (!this.cliente) {
      this.ubicacionEnvio = null;
      this.opcionClienteForm.get('id_Cliente').setValue(null);
      this.checkoutPaso1_5Form.get('clienteUbicacionFacturacion').setValue(null);
      return;
    }

    this.opcionClienteForm.get('id_Cliente').setValue(this.cliente.id_Cliente);
    this.getTotalesInfo();

    const uFacturacionObservable = this.cliente.idUbicacionFacturacion
      ? this.ubicacionService.getUbicacion(this.cliente.idUbicacionFacturacion) : null;
    const uEnvioObservable = this.cliente.idUbicacionEnvio
      ? this.ubicacionService.getUbicacion(this.cliente.idUbicacionEnvio) : null;

    this.isUbicacionesLoading = true;
    if (uFacturacionObservable && uEnvioObservable) {
      forkJoin(uFacturacionObservable, uEnvioObservable)
        .pipe(finalize(() => this.isUbicacionesLoading = false))
        .subscribe(
          (data) => {
            this.ubicacionFacturacion = data[0];
            this.checkoutPaso1_5Form.get('clienteUbicacionFacturacion').setValue(this.ubicacionFacturacion);
            this.ubicacionEnvio = data[1];
          },
          err => this.avisoService.openSnackBar(err.error, '', 3500)
        );
    } else {
      if (uFacturacionObservable) {
        uFacturacionObservable
          .pipe(finalize(() => this.isUbicacionesLoading = false))
          .subscribe(
            (u: Ubicacion) => {
              this.ubicacionFacturacion = u;
              this.checkoutPaso1_5Form.get('clienteUbicacionFacturacion').setValue(this.ubicacionFacturacion);
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      }
      if (uEnvioObservable) {
        this.checkoutPaso1_5Form.get('clienteUbicacionFacturacion').setValue(null);
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
  }

  createForms() {
    this.opcionClienteForm = this.fb.group({
      'id_Cliente': [null, Validators.required]
    });

    this.checkoutPaso1_5Form = this.fb.group({
      'continueStepValidator': ['whatever', Validators.required],
      'clienteUbicacionFacturacion': [ null, Validators.required ]
    });

    this.checkoutPaso2Form = this.fb.group({
      'observaciones': ['', Validators.maxLength(this.observacionesMaxLength)]
    });

    this.checkoutPaso3Form = this.fb.group({
      sucursal: null,
      opcionEnvio: ['', Validators.required],
    });

    this.checkoutPaso3Form.setValidators(sucursalValidator);

    this.checkoutPaso3Form.get('opcionEnvio').valueChanges.subscribe(value => {
      if (value === OpcionEnvio.RETIRO_SUCURSAL) {
        this.checkoutPaso3Form.removeControl('ubicacionEnvio');
      }
      if (value === OpcionEnvio.DIRECCION_FACTURACION) {
        this.checkoutPaso3Form.get('sucursal').setValue(null);
        this.checkoutPaso3Form.removeControl('ubicacionEnvio');
      }
      if (value === OpcionEnvio.DIRECCION_ENVIO) {
        this.checkoutPaso3Form.get('sucursal').setValue(null);
      }
    });

    this.checkoutPaso3Form.get('sucursal').valueChanges.subscribe((value: Empresa) => this.sucursal = value);
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
    this.checkoutPaso1_5Form.get('continueStepValidator').setValue($event ? null : 'whatever');
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
      .subscribe((data: Empresa[]) => {
        this.sucursales = data.filter((value: Empresa) => value.ubicacion.latitud && value.ubicacion.longitud);
      });
  }

  getUbicacionStr(): string {
    const s = this.checkoutPaso3Form.get('sucursal').value;
    return s ? `${s.nombre} (${s.ubicacion.descripcion})` : '(no seleccionada)';
  }

  cerrarOrden() {
    if (
      this.cliente && this.opcionClienteForm.valid && this.checkoutPaso1_5Form.valid &&
      this.checkoutPaso2Form.valid && this.checkoutPaso3Form.valid
    ) {

      const dataEnvio = this.checkoutPaso3Form.value;
      const usarUbicacionDeFacturacion = dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_FACTURACION;
      let uEnvio = null;

      if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_SUCURSAL) {
        uEnvio = dataEnvio.sucursal.ubicacion;
        if (this.ubicacionEnvio && this.ubicacionEnvio.idUbicacion) {
          uEnvio.idUbicacion = this.ubicacionEnvio.idUbicacion;
        } else {
          uEnvio.idUbicacion = null;
        }
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_ENVIO) {
        uEnvio = dataEnvio.ubicacionEnvio;
        delete uEnvio.buscador;

        if (this.ubicacionEnvio && this.ubicacionEnvio.idUbicacion) {
          uEnvio.idUbicacion = this.ubicacionEnvio.idUbicacion;
        } else {
          uEnvio.idUbicacion = null;
        }
      }

      this.opcionClienteForm.disable();
      this.checkoutPaso2Form.disable();
      this.checkoutPaso3Form.disable();
      this.enviarOrdenLoading = true;

      const cerrarOrdenObservable = this.carritoCompraService.enviarOrden(
        usarUbicacionDeFacturacion, this.checkoutPaso2Form.get('observaciones').value,
        this.authService.getLoggedInIdUsuario(), this.cliente.id_Cliente
      );

      if (uEnvio) {
        const ubicacionObservable = uEnvio.idUbicacion
          ? this.ubicacionService.updateUbicacion(uEnvio)
          : this.ubicacionService.createUbicacionEnvioCliente(this.cliente, uEnvio);

        forkJoin(cerrarOrdenObservable, ubicacionObservable).subscribe(
          data => this.cerrarOrdenNext(data[0]),
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
    const dataEnvio = this.checkoutPaso3Form.value;
    let ret = '';
    if (dataEnvio) {
      for (let i = 0; i < this.opcionesEnvio.length; i += 1) {
        if (this.opcionesEnvio[i].value === dataEnvio.opcionEnvio) {
          ret += this.opcionesEnvio[i].text;
          break;
        }
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.RETIRO_SUCURSAL) {
        ret += dataEnvio.sucursal ? ` [${dataEnvio.sucursal.nombre}]` : '';
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_FACTURACION) {
        ret += this.cliente && this.cliente.idUbicacionFacturacion ? ` [${this.cliente.detalleUbicacionFacturacion}]` : '';
      }

      if (dataEnvio.opcionEnvio === OpcionEnvio.DIRECCION_ENVIO) {
        const ubicacionEnvio = this.checkoutPaso3Form.get('ubicacionEnvio').value;
        ret += ubicacionEnvio
          ? ` [${ubicacionEnvio.calle} ${ubicacionEnvio.numero} ${ubicacionEnvio.nombreLocalidad}, ${ubicacionEnvio.nombreProvincia}]`
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
    this.checkoutPaso2Form.enable();
    this.checkoutPaso3Form.enable();
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
