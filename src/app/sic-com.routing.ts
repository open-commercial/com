import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import {CarritoCompraComponent} from './components/carrito-compra/carrito-compra.component';
import {ProductoComponent} from './components/producto/producto.component';
import {ContainerComponent} from './components/container/container.component';
import {ProductosComponent} from './components/productos/productos.component';
import {PerfilComponent} from './components/perfil/perfil.component';
import {PasswordRecoveryComponent} from './components/password-recovery/password-recovery.component';
import {LoginComponent} from './components/login/login.component';
import {RegistracionComponent} from './components/registracion/registracion.component';
import {CheckoutComponent} from './components/checkout/checkout.component';
import {PasswordRecoveryRequestComponent} from './components/password-recovery-request/password-recovery-request.component';
import {HomeComponent} from './components/home/home.component';
import {RegistracionRealizadaComponent} from './components/registracion-realizada/registracion-realizada.component';
import {CheckoutStatusComponent} from './components/checkout-status/checkout-status.component';
import { RubrosComponent } from './components/rubros/rubros.component';

const sicComRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'registracion', component: RegistracionComponent},
  {path: 'registracion-realizada', component: RegistracionRealizadaComponent},
  {path: 'password-recovery-request', component: PasswordRecoveryRequestComponent},
  {path: 'password-recovery', component: PasswordRecoveryComponent},
  {path: '', component: ContainerComponent,
    children: [
      {path: '', component: HomeComponent},
      {path: 'productos', component: ProductosComponent},
      {path: 'producto/:id', component: ProductoComponent},
      {path: 'rubros', component: RubrosComponent},
    ]
  },
  {path: '', component: ContainerComponent, canActivate: [AuthGuard],
    children: [
      {path: 'carrito-compra', component: CarritoCompraComponent},
      {path: 'perfil', component: PerfilComponent},
      {path: 'checkout', component: CheckoutComponent},
      {path: 'checkout/:status', component: CheckoutStatusComponent},
    ]
  },
  {path: '**', redirectTo: ''}
];

export const sicComRouting = RouterModule.forRoot(sicComRoutes);
