import { Component, OnInit } from '@angular/core';
import { Rubro } from '../../models/rubro';
import { RubrosService } from '../../services/rubros.service';
import { AvisoService } from '../../services/aviso.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { RubrosComponent } from '../rubros/rubros.component';

@Component({
  selector: 'sic-com-rubros-en-home',
  templateUrl: './rubros-en-home.component.html',
  styleUrls: ['./rubros-en-home.component.scss']
})
export class RubrosEnHomeComponent implements OnInit {
  loading = false;
  rubros: Rubro[];

  constructor(private rubrosService: RubrosService,
              private avisoService: AvisoService,
              private dialog: MatDialog,
              private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        rubros => this.rubros = rubros,
        err => this.avisoService.openSnackBar(err.error, '', 3500),
      )
    ;
  }

  verTodos() {
    this.dialog.open(RubrosComponent);
  }

  irAProductosConRubro(r: Rubro) {
    this.router.navigate(['/productos'], { queryParams: { r: r.idRubro }});
  }
}
