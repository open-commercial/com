import { Component, Input, OnInit } from '@angular/core';
import { ProductosSliderComponent } from '../productos-slider/productos-slider.component';
import { ProductosService } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import { AvisoService } from '../../services/aviso.service';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';
import { Producto } from '../../models/producto';

@Component({
  selector: 'sic-com-productos-recomendados-slider',
  templateUrl: '../productos-slider/productos-slider.component.html',
  styleUrls: ['../productos-slider/productos-slider.component.scss']
})
export class ProductosRecomendadosSliderComponent extends ProductosSliderComponent implements OnInit {

  private pProductoBase: Producto;
  @Input() set producto(value: Producto) { this.pProductoBase = value; }
  get producto(): Producto { return this.pProductoBase; }

  constructor(protected productosService: ProductosService,
              protected authService: AuthService,
              protected clienteService: ClientesService,
              protected avisoService: AvisoService) {
    super(productosService, authService, clienteService, avisoService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getProductosObservableMethod(pagina: number): Observable<Pagination> {
    return this.productosService.getProductosRecomendados(this.pProductoBase.idProducto, pagina);
  }
}
