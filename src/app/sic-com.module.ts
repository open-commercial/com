import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SicComComponent } from './sic-com.component';
import { LoginComponent } from './components/login/login.component';
import { RegistracionComponent } from './components/registracion/registracion.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ProductosService } from './services/productos.service';
import { AuthService } from './services/auth.service';
import { sicComRouting } from './sic-com.routing';
import { SicComMaterialModule } from './modules/sic-com-material.module';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoCompraComponent } from './components/carrito-compra/carrito-compra.component';
import { CarritoCompraService } from './services/carrito-compra.service';
import { ClientesService } from './services/clientes.service';
import { AuthGuard } from './guards/auth.guard';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SucursalesService } from './services/sucursales.service';
import { AvisoService } from './services/aviso.service';
import { ContainerComponent } from './components/container/container.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { UsuariosService } from './services/usuarios.service';
import { ClienteComponent } from './components/cliente/cliente.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { PedidosService } from './services/pedidos.service';
import { PasswordRecoveryRequestComponent } from './components/password-recovery-request/password-recovery-request.component';
import { PasswordRecoveryComponent } from './components/password-recovery/password-recovery.component';
import { CuentasCorrienteService } from './services/cuentas-corriente.service';
import { CuentaCorrienteComponent } from './components/cuenta-corriente/cuenta-corriente.component';
import { RegistracionService } from './services/registracion.service';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { HomeComponent } from './components/home/home.component';
import { UbicacionFormComponent } from './components/ubicacion-form/ubicacion-form.component';
import { UbicacionComponent } from './components/ubicacion-component/ubicacion.component';
import { ClienteUbicacionesComponent } from './components/cliente-ubicaciones/cliente-ubicaciones.component';
import { SlideshowService } from './services/slideshow.service';
import { UbicacionesService } from './services/ubicaciones.service';
import { AgregarAlCarritoDialogComponent } from './components/agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import { registerLocaleData } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DynamicScriptLoaderService } from './services/dynamic-script-loader.service';
import { PagosService } from './services/pagos.service';
import { GtagModule } from 'angular-gtag';
import { FooterComponent } from './components/footer/footer.component';
import { RegistracionRealizadaComponent } from './components/registracion-realizada/registracion-realizada.component';
import { ProductoCardComponent } from './components/producto-card/producto-card.component';
import { BotonMercadoPagoComponent } from './components/boton-mercado-pago/boton-mercado-pago.component';
import { CheckoutStatusComponent } from './components/checkout-status/checkout-status.component';
import { MercadoPagoDialogComponent } from './components/mercado-pago-dialog/mercado-pago-dialog.component';
import { AgregarAlCarritoComponent } from './components/agregar-al-carrito/agregar-al-carrito.component';
import { RubrosDialogComponent } from './components/rubros-dialog/rubros-dialog.component';
import { RubroButtonComponent } from './components/rubro-button/rubro-button.component';
import { RubrosMainMenuComponent } from './components/rubros-main-menu/rubros-main-menu.component';
import { RubrosEnHomeComponent } from './components/rubros-en-home/rubros-en-home.component';
import { FavoritosComponent } from './components/favoritos/favoritos.component';
import { FavoritoButtonComponent } from './components/favorito-button/favorito-button.component';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { SlideshowComponent } from './components/slideshow/slideshow.component';
import { RubrosListComponent } from './components/rubros-list/rubros-list.component';
import { SvgButtonComponent } from './components/svg-button/svg-button.component';
import { ProductosEnOfertaSliderComponent } from './components/productos-en-oferta-slider/productos-en-oferta-slider.component';
import { ProductosRecomendadosSliderComponent } from './components/productos-recomendados-slider/productos-recomendados-slider.component';
import { MenuComponent } from './components/menu/menu.component';
import { QaBannerComponent } from './components/qa-banner/qa-banner.component';
import { MainBannerComponent } from './components/main-banner/main-banner.component';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es-AR';

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
        UbicacionFormComponent,
        UbicacionComponent,
        ClienteUbicacionesComponent,
        AgregarAlCarritoDialogComponent,
        FooterComponent,
        RegistracionRealizadaComponent,
        ProductoCardComponent,
        BotonMercadoPagoComponent,
        CheckoutStatusComponent,
        MercadoPagoDialogComponent,
        AgregarAlCarritoComponent,
        RubrosDialogComponent,
        RubroButtonComponent,
        RubrosMainMenuComponent,
        RubrosEnHomeComponent,
        FavoritosComponent,
        FavoritoButtonComponent,
        SlideshowComponent,
        RubrosListComponent,
        SvgButtonComponent,
        ProductosEnOfertaSliderComponent,
        ProductosRecomendadosSliderComponent,
        MenuComponent,
        QaBannerComponent,
        MainBannerComponent,
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
        NgSelectModule,
        RecaptchaV3Module,
        RecaptchaModule,
        RecaptchaFormsModule,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        AuthService,
        AuthGuard,
        ProductosService,
        CarritoCompraService,
        ClientesService,
        SucursalesService,
        AvisoService,
        UsuariosService,
        PedidosService,
        CuentasCorrienteService,
        RegistracionService,
        SlideshowService,
        UbicacionesService,
        DynamicScriptLoaderService,
        PagosService,
        { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LdTowkaAAAAACZ5Wts2hesX6x6Lee2T6VRTl7OY' },
    ],
    bootstrap: [
        SicComComponent
    ]
})
export class SicComModule { }
