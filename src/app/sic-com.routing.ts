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


const sicComRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'registracion', component: RegistracionComponent},
  {path: 'password-recovery', component: PasswordRecoveryComponent},
  {path: '', redirectTo: 'productos', pathMatch: 'full'},
  {path: '', component: ContainerComponent,
    children: [
      {path: 'productos', component: ProductosComponent},
      {path: 'producto/:id', component: ProductoComponent},
    ]
  },
  {path: '', component: ContainerComponent, canActivate: [AuthGuard],
    children: [
      {path: 'carrito-compra', component: CarritoCompraComponent},
      {path: 'perfil', component: PerfilComponent},
      {path: 'checkout', component: CheckoutComponent}
    ]
  },
  {path: '**', redirectTo: 'productos'}
];

export const sicComRouting = RouterModule.forRoot(sicComRoutes);
