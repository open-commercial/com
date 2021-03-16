import { Component, OnInit } from '@angular/core';
import { Rubro } from '../../models/rubro';
import { RubrosService } from '../../services/rubros.service';
import { finalize } from 'rxjs/operators';
import { AvisoService } from '../../services/aviso.service';
import { MenuService } from '../../services/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'sic-com-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  loading = false;
  rubros: Rubro[] = [];

  constructor(private rubrosService: RubrosService,
              private avisoService: AvisoService,
              private menuService: MenuService,
              private router: Router) { }

  ngOnInit(): void {
    this.loading = true;
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        rubros => this.rubros = rubros,
        err => this.avisoService.openSnackBar(err.error, 'Cerrar', 0),
      )
    ;
  }

  close() {
    this.menuService.toggle();
  }

  goToMiCuenta() {
    this.router.navigate(['/perfil']);
    this.menuService.toggle();
  }
}
