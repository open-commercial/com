import { Component, OnInit } from '@angular/core';
import { Rubro } from '../../models/rubro';
import { RubrosService } from '../../services/rubros.service';
import { finalize } from 'rxjs/operators';
import { AvisoService } from '../../services/aviso.service';
import { Router } from '@angular/router';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'sic-com-rubros-dialog',
  templateUrl: './rubros-dialog.component.html',
  styleUrls: ['./rubros-dialog.component.scss']
})
export class RubrosDialogComponent implements OnInit {
  loading = false;
  rubros: Rubro[];

  constructor(private dialogRef: MatDialogRef<RubrosDialogComponent>,
              private rubrosService: RubrosService,
              private avisoService: AvisoService,
              private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        rubros => this.rubros = rubros,
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.router.navigate(['']);
        },
      )
    ;
  }

  goToProductos(r: Rubro) {
    this.router.navigate(['/productos'], { queryParams: { r: r.idRubro }});
    this.dialogRef.close();
  }

  volver() {
    this.router.navigate(['']);
  }
}
