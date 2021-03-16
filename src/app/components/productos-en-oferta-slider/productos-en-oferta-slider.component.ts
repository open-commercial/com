import { Component, OnInit } from '@angular/core';
import { ProductosSliderComponent } from '../productos-slider/productos-slider.component';
import { ProductosService } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import { AvisoService } from '../../services/aviso.service';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';

@Component({
  selector: 'sic-com-productos-en-oferta-slider',
  templateUrl: '../productos-slider/productos-slider.component.html',
  styleUrls: ['../productos-slider/productos-slider.component.scss']
})
export class ProductosEnOfertaSliderComponent extends ProductosSliderComponent implements OnInit {

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
    return this.productosService.getProductosEnOferta(pagina);
  }
}
