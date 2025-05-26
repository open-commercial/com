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

  constructor(private readonly rubrosService: RubrosService,
              private readonly avisoService: AvisoService,
              private readonly menuService: MenuService,
              private readonly router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        data => this.rubros = data,
        err => this.avisoService.openSnackBar(err.error, 'Cerrar', 0),
      )
    ;
  }

  close() {
    this.menuService.close();
  }

  goToMiCuenta() {
    this.router.navigate(['/perfil']);
    this.menuService.close();
  }
}
