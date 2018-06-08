import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './guards/auth.guard';
import {CarritoCompraComponent} from './components/carrito-compra/carrito-compra.component';
import {ProductoComponent} from './components/producto/producto.component';
import {ContainerComponent} from './components/container/container.component';
import {ProductosComponent} from './components/productos/productos.component';

const sicComRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: 'productos', pathMatch: 'full'},
  {path: '', component: ContainerComponent, canActivate: [AuthGuard],
    children: [
      {path: 'productos', component: ProductosComponent},
      {path: 'producto/:id', component: ProductoComponent},
      {path: 'carrito-compra', component: CarritoCompraComponent}
    ]},
  {path: '**', redirectTo: 'productos'}
];

export const sicComRouting = RouterModule.forRoot(sicComRoutes);
