import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Rubro } from '../../models/rubro';
import { RubrosService } from '../../services/rubros.service';
import { AvisoService } from '../../services/aviso.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { RubrosDialogComponent } from '../rubros-dialog/rubros-dialog.component';

@Component({
  selector: 'sic-com-rubros-en-home',
  templateUrl: './rubros-en-home.component.html',
  styleUrls: ['./rubros-en-home.component.scss']
})
export class RubrosEnHomeComponent implements OnInit {
  loading = false;
  rubros: Rubro[] = [];
  rubrosToShow: Rubro[] = [];
  count = 0;
  width = 0;

  plusSvgIcon = [
    '<svg fill="red" height="64" width="64" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    '<line stroke="#CCC" x1="12" x2="12" y1="5" y2="19"/><line stroke="#CCC" x1="5" x2="19" y1="12" y2="12"/>',
    '</svg>',
  ].join('');

  @ViewChild('container', { static: false }) container: ElementRef;
  @ViewChild('plusButton', { static: false }) plusButton: ElementRef;

  constructor(private rubrosService: RubrosService,
              private avisoService: AvisoService,
              private dialog: MatDialog,
              private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        rubros => {
          this.rubros = rubros;
          this.calcularFit();
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500),
      )
    ;
    window.onresize = () => {
      this.calcularFit();
    };
  }

  verTodos() {
    this.dialog.open(RubrosDialogComponent);
  }

  irAProductosConRubro(r: Rubro) {
    this.router.navigate(['/productos'], { queryParams: { r: r.idRubro }});
  }

  calcularFit() {
    const containerWidth = this.container.nativeElement.offsetWidth;
    const button = this.plusButton.nativeElement;
    const buttonWidth = button.offsetWidth + 10;
    const count = Math.floor(containerWidth / buttonWidth);

    if (count !== this.count) {
      this.rubrosToShow = this.rubros.slice(0, count - 1);
    }
  }
}
