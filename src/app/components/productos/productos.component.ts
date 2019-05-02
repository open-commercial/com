import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from 'app/services/aviso.service';
import {combineLatest, Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {Cliente} from '../../models/cliente';

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
  busquedaCriteria = '';
  buscarProductosSubscription: Subscription;
  cliente: Cliente = null;

  constructor(private productosService: ProductosService,
              private route: ActivatedRoute,
              private avisoService: AvisoService,
              private authService: AuthService,
              private router: Router,
              private carritoCompraService: CarritoCompraService) {
  }

  ngOnInit() {
    this.buscarProductosSubscription = this.productosService.buscarProductos$.subscribe(criteria => {
      this.busquedaCriteria = criteria;
      this.cargarProductos();
    });

    combineLatest(this.route.paramMap, this.route.queryParamMap)
      .subscribe(([params, queryParams]) => {
        this.pagina = (Number(queryParams['params'].p) - 1) || 0;
        this.productosService.buscarProductos(params['params'].q || '');
      });
  }

  ngOnDestroy() {
    this.buscarProductosSubscription.unsubscribe();
  }

  cargarProductos() {
    this.loadingProducts = true;
    this.productos = [];
    this.productosService.getProductos(this.pagina).subscribe(
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

  estaBonificado(p) {
    return this.authService.isAuthenticated() && p.precioBonificado !== p.precioLista;
  }

  paginaAnterior() {
    if (this.pagina <= 0) { return; }
    this.router.navigate(['/productos', { q: this.busquedaCriteria || '' }], { queryParams: { p: this.pagina } });
  }

  paginaSiguiente() {
    if (this.pagina + 1 >= this.totalPaginas) { return; }
    this.router.navigate(['/productos', { q: this.busquedaCriteria || '' }], { queryParams: { p: this.pagina + 2 } });
  }

  agregarAlCarrito(p: Producto) {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    /*
    this.cargandoAlCarrito = true;
    this.carritoCompraService.agregarQuitarAlPedido(this.producto, this.cantidad)
      .subscribe(
        data => {
          if (this.cliente) {
            this.carritoCompraService.getCarritoCompra(this.cliente.id_Cliente)
              .subscribe(
                (carrito: CarritoCompra) => {
                  this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones);
                  this.cargandoAlCarrito = false;
                },
                err => {
                  this.avisoService.openSnackBar(err.error, '', 3500);
                  this.cargandoAlCarrito = false;
                }
              );
          }
        },
        err => {
          this.cargandoAlCarrito = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
    */
  }
}
