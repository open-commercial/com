import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {CarritoCompra} from '../../models/carrito-compra';

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
  cliente: Cliente = null;

  constructor(public authService: AuthService, private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService, private router: Router,
              private clientesService: ClientesService,
              private avisoService: AvisoService) {}

  ngOnInit() {
    const criteriaControl = this.busquedaForm.get('criteriaControl');
    criteriaControl.setValue(this.productosService.getInputCriteria());

    this.loadNavbarInfo();
    this.carritoCompraService.cantidadItemsEnCarrito$.subscribe(data => this.cantidadItemsEnCarrito = data);
    this.authService.nombreUsuarioLoggedIn$.subscribe(data => this.usuarioConectado = data);

    this.productosService.buscarProductos$.subscribe(data => {
      this.busquedaCriteria = data;
      criteriaControl.setValue(data);
    });
  }

  loadNavbarInfo() {
    if (this.authService.isAuthenticated()) {
      this.authService.getLoggedInUsuario().subscribe(
        data => this.usuarioConectado = data['nombre'] + ' ' + data['apellido'],
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );

      this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
        (cliente: Cliente) => {
          this.cliente = cliente;
          this.carritoCompraService.getCarritoCompra(cliente.idCliente).subscribe(
            (carrito: CarritoCompra) => this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones),
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
        }
      );
    }
  }

  submit() {
    this.buscarProductos(this.busquedaForm.get('criteriaControl').value);
  }

  buscarProductos(criteria: string) {
    criteria = criteria === null ? '' : criteria;
    this.router.navigate(['/productos'], { queryParams: { q: criteria }});
  }

  goToLogin() {
    this.router.navigate(['login']);
  }

  goToRegistracion() {
    this.router.navigate(['registracion']);
  }
}
