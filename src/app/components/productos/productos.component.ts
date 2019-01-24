import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from 'app/services/aviso.service';
import {combineLatest, Subject, Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';

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

  constructor(private productosService: ProductosService,
              private route: ActivatedRoute,
              private avisoService: AvisoService,
              private authService: AuthService,
              private router: Router) {
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

  cambioDePagina($event) {
    this.router.navigate(['/productos', { q: this.busquedaCriteria || '' }], { queryParams: { p: $event.pageIndex + 1 } });
  }
}
