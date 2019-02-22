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
import {debounceTime, finalize} from 'rxjs/operators';
import {MatStepper} from '@angular/material';
import {Router} from '@angular/router';
import {LatLng, MapsAPILoader} from '@agm/core';
// import { GooglePlaceDirective } from 'ngx-google-places-autocomplete/ngx-google-places-autocomplete.directive';

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

  sucursales = [];

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
      sucursal_id: null,
      direccion: this.fb.group({
        localidad: '',
        provincia: '',
        calle: '',
        numero: '',
        piso: '',
        descripcion: ''
      })
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
    this.sucursales =  [
      {
        lat: -27.4668594,
        lng: -58.8375417,
        title: 'Local Comercial (9 de Julio 1021)',
        iconUrl: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/c_scale,w_30/v1545358178/assets/shopping_cart.png'
      },
      {
        lat: -27.493300,
        lng: -58.782717,
        title: 'Depósito Principal (Napoles 5600)',
        iconUrl: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/c_scale,w_30/v1545358178/assets/shopping_cart.png'
      },
    ];
  }

  markerSucursalesClick($event) {
    console.log($event.id());
  }

  handleAddressChange($event) {
    console.log($event);
  }

  getAddress( lat: number, lng: number ) {
    console.log('Finding Address');
    if (navigator.geolocation) {
      const geocoder = new (<any>window).google.maps.Geocoder();
      const latlng = new (<any>window).google.maps.LatLng(lat, lng);
      const request = { latLng: latlng };
      geocoder.geocode(request, (results, status) => {
        if (status === (<any>window).google.maps.GeocoderStatus.OK) {
          const result = results[0];
          const rsltAdrComponent = result.address_components;
          const resultLength = rsltAdrComponent.length;
          if (result != null) {
            // this.address = rsltAdrComponent[resultLength - 8].short_name;
            console.log(results);
          } else {
            alert('No address available!');
          }
        }
      });
    }
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
