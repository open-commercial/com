import { Component, Input } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { Rubro } from '../../models/rubro';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'sic-com-rubros-list',
  templateUrl: './rubros-list.component.html',
  styleUrls: ['./rubros-list.component.scss']
})
export class RubrosListComponent {
  private pRubros: Rubro[] = [];
  @Input() set rubros(value: Rubro[]) { this.pRubros = value; }
  get rubros(): Rubro[] { return this.pRubros; }

  private pSelected: Rubro = null;
  @Input() set selected(value: Rubro) { this.pSelected = value; }
  get selected(): Rubro { return this.pSelected; }

  private pHideTodos = false;
  @Input() set hideTodos(value: boolean) { this.pHideTodos = value; }
  get hideTodos() { return this.pHideTodos; }

  constructor(public helper: HelperService,
              private router: Router,
              private menuService: MenuService) { }

  goToProductos(r: Rubro = null) {
    const queryParams = r ? { r: r.idRubro } : {};
    this.menuService.toggle();
    this.router.navigate(['/productos'], { queryParams: queryParams });
  }

  clear() {
    this.goToProductos();
  }
}
