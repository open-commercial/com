import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SicComComponent} from './sic-com.component';
import {LoginComponent} from './components/login/login.component';
import {RegistracionComponent} from './components/registracion/registracion.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {ProductosComponent} from './components/productos/productos.component';
import {ProductosService} from './services/productos.service';
import {AuthService} from './services/auth.service';
import {sicComRouting} from './sic-com.routing';
import {SicComMaterialModule} from './modules/sic-com-material.module';
import {ProductoComponent} from './components/producto/producto.component';
import {CarritoCompraComponent} from './components/carrito-compra/carrito-compra.component';
import {CarritoCompraService} from './services/carrito-compra.service';
import {ClientesService} from './services/clientes.service';
import {AuthGuard} from './guards/auth.guard';
import {JwtInterceptor} from './interceptors/jwt.interceptor';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {SucursalService} from './services/sucursal.service';
import {AvisoService} from './services/aviso.service';
import {ContainerComponent} from './components/container/container.component';
import {ConfirmationDialogComponent} from './components/confirmation-dialog/confirmation-dialog.component';
import {PerfilComponent} from './components/perfil/perfil.component';
import {UsuarioComponent} from './components/usuario/usuario.component';
import {UsuariosService} from './services/usuarios.service';
import {ClienteComponent} from './components/cliente/cliente.component';
import {PedidosComponent} from './components/pedidos/pedidos.component';
import {PedidosService} from './services/pedidos.service';
import {PasswordRecoveryRequestComponent} from './components/password-recovery-request/password-recovery-request.component';
import {PasswordRecoveryComponent} from './components/password-recovery/password-recovery.component';
import {CuentasCorrienteService} from './services/cuentas-corriente.service';
import {CuentaCorrienteComponent} from './components/cuenta-corriente/cuenta-corriente.component';
import {NgxCaptchaModule} from 'ngx-captcha';
import {RegistracionService} from './services/registracion.service';
import {CheckoutComponent} from './components/checkout/checkout.component';
import {SlideshowModule} from 'ng-simple-slideshow';
import {HomeComponent} from './components/home/home.component';
import {ProductosEnOfertaComponent} from './components/productos-en-oferta/productos-en-oferta.component';
import {UbicacionFormComponent} from './components/ubicacion-form/ubicacion-form.component';
import {UbicacionComponent} from './components/ubicacion-component/ubicacion.component';
import {ClienteUbicacionesComponent} from './components/cliente-ubicaciones/cliente-ubicaciones.component';
import {SlideshowService} from './services/slideshow.service';
import {UbicacionesService} from './services/ubicaciones.service';
import {AgmCoreModule} from '@agm/core';
import {AgmSnazzyInfoWindowModule} from '@agm/snazzy-info-window';
import {AgregarAlCarritoDialogComponent} from './components/agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import {registerLocaleData} from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es-AR';
import {NgSelectModule} from '@ng-select/ng-select';
import {DynamicScriptLoaderService} from './services/dynamic-script-loader.service';
import {MercadoPagoComponent} from './components/mercado-pago/mercado-pago.component';
import {PagosService} from './services/pagos.service';
import {GtagModule} from 'angular-gtag';
import {CompraRealizadaComponent} from './components/compra-realizada/compra-realizada.component';
import {FooterComponent} from './components/footer/footer.component';
import {RegistracionRealizadaComponent} from './components/registracion-realizada/registracion-realizada.component';

registerLocaleData(localeEs, 'es-AR', localeEsExtra);

@NgModule({
  declarations: [
    SicComComponent,
    LoginComponent,
    RegistracionComponent,
    NavbarComponent,
    ProductosComponent,
    ProductoComponent,
    ContainerComponent,
    CarritoCompraComponent,
    ConfirmationDialogComponent,
    PerfilComponent,
    UsuarioComponent,
    ClienteComponent,
    PedidosComponent,
    PasswordRecoveryRequestComponent,
    PasswordRecoveryComponent,
    CuentaCorrienteComponent,
    CheckoutComponent,
    HomeComponent,
    ProductosEnOfertaComponent,
    UbicacionFormComponent,
    UbicacionComponent,
    ClienteUbicacionesComponent,
    AgregarAlCarritoDialogComponent,
    MercadoPagoComponent,
    CompraRealizadaComponent,
    FooterComponent,
    RegistracionRealizadaComponent
  ],
  imports: [
    GtagModule.forRoot({ trackingId: 'UA-132433044-1', trackPageviews: true }),
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    SicComMaterialModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    sicComRouting,
    NgxCaptchaModule,
    SlideshowModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCB4ieC2bSFgfWwHcpdFGegDH7vb8K5YG8',
      libraries: ['places']
    }),
    AgmSnazzyInfoWindowModule,
    NgSelectModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    AuthService,
    AuthGuard,
    ProductosService,
    CarritoCompraService,
    ClientesService,
    SucursalService,
    AvisoService,
    UsuariosService,
    PedidosService,
    CuentasCorrienteService,
    RegistracionService,
    SlideshowService,
    UbicacionesService,
    DynamicScriptLoaderService,
    PagosService,
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    AgregarAlCarritoDialogComponent,
  ],
  bootstrap: [
    SicComComponent
  ]
})
export class SicComModule {}
