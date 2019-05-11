import {Component, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {Producto} from '../../models/producto';
import {AuthService} from '../../services/auth.service';
import {finalize} from 'rxjs/operators';
import {AvisoService} from '../../services/aviso.service';

@Component({
  selector: 'sic-com-productos-destacados',
  templateUrl: 'productos-destacados.component.html',
  styleUrls: ['./productos-destacados.component.scss']
})
export class ProductosDestacadosComponent implements OnInit {

  destacados: Producto[] = [];

  loading = false;
  totalPaginas = 0;
  pagina = 0;

  constructor(private productosService: ProductosService,
              private authService: AuthService,
              private avisoService: AvisoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  estaBonificado(p) {
    return this.authService.isAuthenticated() && p.precioBonificado !== p.precioLista;
  }

  cargarProductos() {
    this.loading = true;
    this.productosService.getProductosDestacados(this.pagina)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (data) => {
          data['content'] = this.shuffle(data['content']);
          data['content'].forEach(p => this.destacados.push(p));
          this.totalPaginas = data['totalPages'];
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );
  }

  paginaSiguiente() {
    this.pagina += 1;
    this.cargarProductos();
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
