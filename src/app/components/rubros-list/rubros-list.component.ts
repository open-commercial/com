import { Component, Input, OnInit } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { Rubro } from '../../models/rubro';
import { Router } from '@angular/router';

@Component({
  selector: 'sic-com-rubros-list',
  templateUrl: './rubros-list.component.html',
  styleUrls: ['./rubros-list.component.scss']
})
export class RubrosListComponent implements OnInit {
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
              private router: Router) { }

  ngOnInit(): void {
  }

  goToProductos(r: Rubro = null) {
    const queryParams = r ? { r: r.idRubro } : {};
    this.router.navigate(['/productos'], { queryParams: queryParams });
  }

  clear() {
    this.goToProductos();
  }
}
