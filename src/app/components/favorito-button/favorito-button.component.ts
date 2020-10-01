import { Component, Input, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { AuthService } from '../../services/auth.service';
import { ProductosService } from '../../services/productos.service';
import { finalize } from 'rxjs/operators';
import { AvisoService } from '../../services/aviso.service';

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
              private productoService: ProductosService,
              private avisoService: AvisoService) {
  }

  ngOnInit() {
  }

  toggleFavorito($event) {
    $event.stopPropagation();
    this.toggling = true;
    if (this.pProducto.favorito) {
      this.productoService.quitarProductoDeFavorito(this.pProducto.idProducto)
        .pipe(finalize(() => this.toggling = false))
        .subscribe(
          () => this.producto.favorito = false,
          err => this.avisoService.openSnackBar(err.error, 'Cerrar', 0),
        )
      ;
    } else {
      this.productoService.marcarComoFavorito(this.pProducto.idProducto)
        .pipe(finalize(() => this.toggling = false))
        .subscribe(
          (p: Producto) => this.producto.favorito = true,
          err => this.avisoService.openSnackBar(err.error, 'Cerrar', 0),
        )
      ;
    }
  }
}
