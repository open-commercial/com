import {Component, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';

@Component({
  selector: 'sic-com-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  cantidadItemsEnCarrito = 0;
  usuarioConectado = '';
  busquedaCriteria;

  constructor(private authService: AuthService, private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService, private router: Router,
              private avisoService: AvisoService) {}

  ngOnInit() {
    this.usuarioConectado = this.authService.getUsername();
    this.carritoCompraService.getCantidadRenglones().subscribe(
      data => this.carritoCompraService.setCantidadItemsEnCarrito(Number(data)),
      err => this.avisoService.openSnackBar(err.error, '', 3500));
    this.carritoCompraService.cantidadItemsEnCarrito$.subscribe(data => this.cantidadItemsEnCarrito = data);
    this.productosService.buscarProductos$.subscribe(data => this.busquedaCriteria = data);
  }

  buscarProductos(criteria: string) {
    this.productosService.buscarProductos(criteria);
    this.router.navigate(['/productos', {busqueda: criteria}]);
  }

  logout() {
    this.authService.logout();
  }
}
