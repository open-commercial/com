import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'sic-com-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  cantidadItemsEnCarrito = 0;
  usuarioConectado = '';
  busquedaCriteria = '';
  busquedaForm = new FormGroup ({
    criteriaControl: new FormControl()
  });

  constructor(private authService: AuthService, private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService, private router: Router,
              private avisoService: AvisoService) {
    const criteriaControl = this.busquedaForm.get('criteriaControl');
    criteriaControl.valueChanges.pipe(debounceTime(700)).subscribe(
      data => this.buscarProductos(data)
    );
  }

  ngOnInit() {
    this.authService.getLoggedInUsuario().subscribe(
      data => this.usuarioConectado = data['nombre'] + ' ' + data['apellido'],
      err => this.avisoService.openSnackBar(err.error, '', 3500)
    );
    this.carritoCompraService.getCantidadRenglones().subscribe(
      data => this.carritoCompraService.setCantidadItemsEnCarrito(Number(data)),
      err => this.avisoService.openSnackBar(err.error, '', 3500));
    this.carritoCompraService.cantidadItemsEnCarrito$.subscribe(data => this.cantidadItemsEnCarrito = data);
    this.productosService.buscarProductos$.subscribe(data => this.busquedaCriteria = data);
    this.authService.nombreUsuarioLoggedIn$.subscribe(data => this.usuarioConectado = data);
  }

  buscarProductos(criteria: string) {
    criteria = criteria === null ? '' : criteria;
    this.productosService.buscarProductos(criteria);
    this.router.navigate(['/productos', {busqueda: criteria}]);
  }

  logout() {
    this.authService.logout();
  }
}
