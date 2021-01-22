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
import { combineLatest } from 'rxjs';
import { RubrosService } from '../../services/rubros.service';
import { finalize } from 'rxjs/operators';
import { Rubro } from '../../models/rubro';

@Component({
  selector: 'sic-com-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  cantidadItemsEnCarrito = 0;
  cantidadEnFavoritos = 0;
  usuarioConectado = '';
  busquedaForm = new FormGroup ({
    criteriaControl: new FormControl()
  });
  cliente: Cliente = null;
  loading = false;
  rubros: Rubro[] = [];

  constructor(public authService: AuthService,
              private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService, private router: Router,
              private clientesService: ClientesService,
              private rubrosService: RubrosService,
              private avisoService: AvisoService) {}

  ngOnInit() {
    const criteriaControl = this.busquedaForm.get('criteriaControl');
    const bCriteria = this.productosService.getCriteria();
    const value = bCriteria ? bCriteria.codigo || bCriteria.descripcion : '';
    criteriaControl.setValue(value);

    this.loadNavbarInfo();

    this.carritoCompraService.cantidadItemsEnCarrito$.subscribe(data => this.cantidadItemsEnCarrito = data);
    this.authService.nombreUsuarioLoggedIn$.subscribe(data => this.usuarioConectado = data);
    this.productosService.cantidadEnFavoritos$.subscribe(data => this.cantidadEnFavoritos = data);

    this.productosService.buscarProductos$.subscribe(data => {
      const v = data ? data.codigo || data.descripcion : '';
      criteriaControl.setValue(v);
    });

    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        rubros => this.rubros = rubros,
        err => this.avisoService.openSnackBar(err.error, 'Cerrar', 0),
      )
    ;
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
          combineLatest([
            this.carritoCompraService.getCarritoCompra(),
            this.productosService.getCantidadEnFavoritos(),
          ])
          .subscribe(
            (data: [CarritoCompra, number]) => {
              this.carritoCompraService.setCantidadItemsEnCarrito(data[0].cantRenglones);
              this.productosService.setCantidadEnFavoritos(data[1]);
            }
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
}
