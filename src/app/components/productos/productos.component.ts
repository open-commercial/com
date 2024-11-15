import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {AvisoService} from 'app/services/aviso.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import { MatDialog } from '@angular/material/dialog';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import { BusquedaProductoCriteria } from '../../models/criterias/BusquedaProductoCriteria';
import { ScrollPositionService } from '../../services/scroll-position.service';
import { finalize } from 'rxjs/operators';

const SCROLL_POSITION_PAGE_KEY = 'productos';

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
  routeSub: Subscription;

  constructor(private clienteService: ClientesService,
              private productosService: ProductosService,
              private route: ActivatedRoute,
              private avisoService: AvisoService,
              private authService: AuthService,
              private router: Router,
              private dialog: MatDialog,
              private scrollPositionSevice: ScrollPositionService) {
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

    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const url = document.location.pathname + document.location.search;
        this.scrollPositionSevice.storeScrollPosition(SCROLL_POSITION_PAGE_KEY, url);
      }
    });
  }

  ngOnDestroy() {
    this.buscarProductosSubscription.unsubscribe();
    this.routeSub.unsubscribe();
  }

  cargarProductos() {
    this.loadingProducts = true;
    this.productos = [];
    this.productosService.getProductosSoloPublicos(this.pagina)
      .pipe(finalize(() => {
        this.loadingProducts = false;
        const url = document.location.pathname + document.location.search;
        setTimeout(() => {
          this.scrollPositionSevice.restorePosition(SCROLL_POSITION_PAGE_KEY, url);
        }, 200);
      }))
      .subscribe(
      data => {
        data['content'].forEach(p => {
          if (p.urlImagen == null || p.urlImagen === '') {
            p.urlImagen = 'assets/images/sin_imagen.png';
          }
          this.productos.push(p);
        });
        this.totalPaginas = data['totalPages'];
        this.totalElements = data['totalElements'];
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
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
