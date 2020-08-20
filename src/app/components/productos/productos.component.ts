import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from 'app/services/aviso.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import { MatDialog } from '@angular/material/dialog';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import { RubrosMainMenuType } from '../rubros-main-menu/rubros-main-menu.component';
import { BusquedaProductoCriteria } from '../../models/criterias/BusquedaProductoCriteria';

@Component({
  selector: 'sic-com-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit, OnDestroy {
  productos = [];
  loadingProducts = false;
  totalPaginas = 0;
  totalElements = 0;
  pagina = 0;
  busquedaCriteria: BusquedaProductoCriteria = null;
  buscarProductosSubscription: Subscription;
  cliente: Cliente = null;

  rubrosMMTypes = RubrosMainMenuType;

  constructor(private clienteService: ClientesService,
              private productosService: ProductosService,
              private route: ActivatedRoute,
              private avisoService: AvisoService,
              private authService: AuthService,
              private router: Router,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.buscarProductosSubscription = this.productosService.buscarProductos$.subscribe(criteria => {
      this.busquedaCriteria = criteria;
      this.cargarProductos();
    });

    this.route.queryParamMap.subscribe((params) => {
      let p = Number(params.get('p'));

      p = isNaN(p) ? 1 : (p < 1 ? 1 : p);
      this.pagina = p - 1;

      const q = params.get('q') || '';
      const r = params.has('r') && !isNaN(Number(params.get('r'))) ? Number(params.get('r')) : null;
      const criteria: BusquedaProductoCriteria = {
        codigo: q,
        descripcion: q,
        pagina: p,
        idRubro: r
      };
      this.productosService.buscarProductos(criteria);
    });

    if (this.authService.isAuthenticated()) {
      this.clienteService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
        .subscribe((c: Cliente) => this.cliente = c);
    }
  }

  ngOnDestroy() {
    this.buscarProductosSubscription.unsubscribe();
  }

  cargarProductos() {
    this.loadingProducts = true;
    this.productos = [];
    this.productosService.getProductosSoloPublicos(this.pagina).subscribe(
      data => {
        data['content'].forEach(p => {
          if (p.urlImagen == null || p.urlImagen === '') {
            p.urlImagen = 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1545616229/assets/sin_imagen.png';
          }
          this.productos.push(p);
        });
        this.totalPaginas = data['totalPages'];
        this.totalElements = data['totalElements'];
        this.loadingProducts = false;
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.loadingProducts = false;
      }
    );
  }

  estaBonificado(p: Producto) {
    return p.precioBonificado && p.precioBonificado < p.precioLista;
  }

  paginaAnterior() {
    if (this.pagina <= 0) { return; }
    this.router.navigate(['/productos'], { queryParams: this.getQueryParams(this.pagina) });
  }

  paginaSiguiente() {
    if (this.pagina + 1 >= this.totalPaginas) { return; }
    this.router.navigate(['/productos'], { queryParams:  this.getQueryParams(this.pagina + 2) });
  }

  showDialogCantidad($event, producto: Producto) {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    $event.stopPropagation();
    dialogRef.componentInstance.producto = producto;
    dialogRef.componentInstance.cliente = this.cliente;
  }

  getQueryParams(pagina: number) {
    const ret = { p: pagina };
    if (this.busquedaCriteria && (this.busquedaCriteria.codigo || this.busquedaCriteria.descripcion)) {
      ret['q'] = this.busquedaCriteria.codigo || this.busquedaCriteria.descripcion;
    }
    if (this.busquedaCriteria && this.busquedaCriteria.idRubro) {
      ret['r'] = this.busquedaCriteria.idRubro;
    }
    return ret;
  }
}
