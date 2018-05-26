import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SicComComponent} from '../sic-com.component';
import {LoginComponent} from '../components/login/login.component';
import {NavbarComponent} from '../components/navbar/navbar.component';
import {ProductosComponent} from '../components/productos/productos.component';
import {ProductosService} from '../services/productos.service';
import {AuthService} from '../services/auth.service';
import {RubrosService} from '../services/rubros.service';
import {sicComRouting} from '../sic-com.routing';
import {SicComCurrencyPipe} from '../pipes/sic-com-currency.pipe';
import {SicComMaterialModule} from './sic-com-material.module';
import {ProductoComponent} from '../components/producto/producto.component';
import {CarritoCompraComponent} from '../components/carrito-compra/carrito-compra.component';
import {CarritoCompraService} from '../services/carrito-compra.service';
import {ClientesService} from '../services/clientes.service';
import {CheckoutDialogComponent} from '../components/carrito-compra/checkoutDialog/checkout-dialog.component';
import {SicComFilterPipe} from '../pipes/sic-com-filter.pipe';
import {AuthGuard} from '../guards/auth.guard';
import {JwtInterceptor} from '../interceptors/jwt.interceptor';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {EmpresasService} from '../services/empresas.service';
import {AvisoService} from '../services/aviso.service';
import {ContainerComponent} from '../components/container/container.component';
import {ClientesDialogComponent} from '../components/carrito-compra/clientesDialog/clientes-dialog.component';

@NgModule({
  declarations: [
    SicComComponent,
    LoginComponent,
    NavbarComponent,
    ProductosComponent,
    ProductoComponent,
    ContainerComponent,
    CheckoutDialogComponent,
    ClientesDialogComponent,
    CarritoCompraComponent,
    SicComCurrencyPipe,
    SicComFilterPipe
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    SicComMaterialModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    sicComRouting
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    AuthService,
    AuthGuard,
    ProductosService,
    RubrosService,
    CarritoCompraService,
    ClientesService,
    EmpresasService,
    AvisoService
  ],
  entryComponents: [
    ClientesDialogComponent,
    CheckoutDialogComponent
  ],
  bootstrap: [
    SicComComponent
  ]
})
export class SicComModule {}
