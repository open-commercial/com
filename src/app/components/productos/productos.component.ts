import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {ActivatedRoute} from '@angular/router';
import {AvisoService} from 'app/services/aviso.service';
import {Subscription} from 'rxjs';
import {IImage} from 'ng-simple-slideshow';
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
  pagina = 0;
  busquedaCriteria = '';
  buscarProductosSubscription: Subscription;

  constructor(private productosService: ProductosService,
              private route: ActivatedRoute,
              private avisoService: AvisoService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.busquedaCriteria = this.route.snapshot.paramMap.get('busqueda') || '';
    this.buscarProductosSubscription = this.productosService.buscarProductos$.subscribe(data => {
      this.busquedaCriteria = data;
      this.cargarProductos(true);
    });

    this.productosService.buscarProductos(this.busquedaCriteria);
  }

  ngOnDestroy() {
    this.buscarProductosSubscription.unsubscribe();
  }

  cargarProductos(reset: boolean) {
    this.loadingProducts = true;
    if (reset) {
      this.pagina = 0;
    }
    this.productosService.getProductos(this.pagina, this.authService.isAuthenticated())
      .subscribe(
      data => {
        if (reset) {
          this.pagina = 0;
          this.productos = [];
        }
        data['content'].forEach(p => {
          if (p.urlImagen == null || p.urlImagen === '') {
            p.urlImagen = '../../../assets/no-image.png';
          }
          this.productos.push(p);
        });
        this.totalPaginas = data['totalPages'];
        this.loadingProducts = false;
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.loadingProducts = false;
      });
  }

  masProductos() {
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarProductos(false);
    }
  }

  estaBonificado(p) {
    return this.authService.isAuthenticated() && p.precioBonificado !== p.precioLista;
  }
}
