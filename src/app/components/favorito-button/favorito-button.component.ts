import { Component, Input, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { AuthService } from '../../services/auth.service';
import { ProductosService } from '../../services/productos.service';
import { finalize } from 'rxjs/operators';
import { AvisoService } from '../../services/aviso.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'sic-com-favorito-button',
  templateUrl: './favorito-button.component.html',
  styleUrls: ['./favorito-button.component.scss']
})
export class FavoritoButtonComponent implements OnInit {
  private pProducto: Producto;
  @Input() set producto(value: Producto) { this.pProducto = value; }
  get producto() { return this.pProducto; }

  toggling = false;

  constructor(public authService: AuthService,
              private productosService: ProductosService,
              private avisoService: AvisoService) {
  }

  ngOnInit() {
  }

  toggleFavorito($event) {
    $event.stopPropagation();
    $event.preventDefault();
    const obs: Observable<void> = this.pProducto.favorito
      ? this.productosService.quitarProductoDeFavorito(this.pProducto.idProducto)
      : this.productosService.marcarComoFavorito(this.pProducto.idProducto)
    ;
    this.toggling = true;
    obs.subscribe(
      () => {
        this.pProducto.favorito = !this.pProducto.favorito;
        this.productosService.getCantidadEnFavoritos()
          .pipe(finalize(() => this.toggling = false))
          .subscribe(
            (cantidad: number) => this.productosService.setCantidadEnFavoritos(cantidad),
            err => this.avisoService.openSnackBar(err.error, 'Cerrar', 0),
          )
        ;
      },
      err => {
        this.toggling = false;
        this.avisoService.openSnackBar(err.error, 'Cerrar', 0);
      },
    );
  }
}
