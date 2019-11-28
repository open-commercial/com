import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from 'app/services/aviso.service';
import {combineLatest, Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import { MatDialog } from '@angular/material/dialog';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';

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

    combineLatest(this.route.paramMap, this.route.queryParamMap)
      .subscribe(([params, queryParams]) => {
        this.pagina = (Number(queryParams['params'].p) - 1) || 0;
        this.productosService.buscarProductos(params['params'].q || '');
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
    return this.authService.isAuthenticated() && p.precioListaBonificado && p.precioListaBonificado !== p.precioLista;
  }

  paginaAnterior() {
    if (this.pagina <= 0) { return; }
    this.router.navigate(['/productos', { q: this.busquedaCriteria || '' }], { queryParams: { p: this.pagina } });
  }

  paginaSiguiente() {
    if (this.pagina + 1 >= this.totalPaginas) { return; }
    this.router.navigate(['/productos', { q: this.busquedaCriteria || '' }], { queryParams: { p: this.pagina + 2 } });
  }

  showDialogCantidad($event, producto: Producto) {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    $event.stopPropagation();
    dialogRef.componentInstance.producto = producto;
    dialogRef.componentInstance.cliente = this.cliente;
  }
}
