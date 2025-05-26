import { Component, OnInit } from '@angular/core';
import { RubrosService } from '../../services/rubros.service';
import { Rubro } from '../../models/rubro';
import { finalize } from 'rxjs/operators';
import { AvisoService } from '../../services/aviso.service';
import { ProductosService } from '../../services/productos.service';
import { BusquedaProductoCriteria } from '../../models/criterias/BusquedaProductoCriteria';
import { Router } from '@angular/router';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'sic-com-rubros-main-menu',
  templateUrl: './rubros-main-menu.component.html',
  styleUrls: ['./rubros-main-menu.component.scss']
})
export class RubrosMainMenuComponent implements OnInit {

  rubros: Rubro[] = [];
  loading = false;
  selected: Rubro = null;
  isOpen = false;

  constructor(private readonly rubrosService: RubrosService,
              private readonly productosService: ProductosService,
              private readonly avisoService: AvisoService,
              private readonly router: Router,
              public helper: HelperService) {}

  ngOnInit() {
    this.loading = true;
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        data => {
          this.rubros = data;
          this.init();
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500),
      );
  }

  init() {
    this.setBusquedaCriteriaAsSelected(this.productosService.getCriteria());
    this.productosService.buscarProductos$.subscribe(data => {
      this.setBusquedaCriteriaAsSelected(data);
    });
  }

  setBusquedaCriteriaAsSelected(bCriteria: BusquedaProductoCriteria) {
    if (bCriteria?.idRubro) {
      const aux = this.rubros.filter(r => r.idRubro === bCriteria.idRubro);
      if (aux.length) {
        this.selected = aux[0];
      } else {
        this.selected = null;
      }
    } else {
      this.selected = null;
    }
  }

  goToProductos(r: Rubro = null) {
    const queryParams = r ? { r: r.idRubro } : {};
    this.router.navigate(['/productos'], { queryParams: queryParams });
  }

  clear() {
    this.goToProductos();
  }
}
