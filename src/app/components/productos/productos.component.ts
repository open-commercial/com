import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {ActivatedRoute} from '@angular/router';
import {AvisoService} from 'app/services/aviso.service';
import {Subscription} from 'rxjs';

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
  tamanioPagina = 10;
  busquedaCriteria = '';
  buscarProductosSubscription: Subscription;

  constructor(private productosService: ProductosService, private route: ActivatedRoute, private avisoService: AvisoService) {}

  ngOnInit() {
    this.busquedaCriteria = this.route.snapshot.paramMap.get('busqueda') || '';

    this.buscarProductosSubscription = this.productosService.buscarProductos$.subscribe(data => {
      this.busquedaCriteria = data;
      this.cargarProductos(true);
    });

    this.productosService.buscarProductos(this.busquedaCriteria);
    this.cargarProductos(true);
  }

  ngOnDestroy() {
    this.buscarProductosSubscription.unsubscribe();
  }

  cargarProductos(reset: boolean) {
    if (reset) {
      this.productos = [];
      this.pagina = 0;
    }
    this.loadingProducts = true;
    this.productosService.getProductos(this.pagina, this.tamanioPagina).subscribe(
      data => {
        data['content'].forEach(p => this.productos.push(p));
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
}
