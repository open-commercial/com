import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Rubro } from '../../models/rubro';
import { RubrosService } from '../../services/rubros.service';
import { AvisoService } from '../../services/aviso.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { RubrosDialogComponent } from '../rubros-dialog/rubros-dialog.component';

const plusSvgIcon = [
  '<svg fill="red" height="64" width="64" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
  '<line stroke="#CCC" x1="12" x2="12" y1="5" y2="19"/><line stroke="#CCC" x1="5" x2="19" y1="12" y2="12"/>',
  '</svg>',
].join('');

const rubroMas: Rubro = {
  idRubro: 0,
  nombre: 'Más',
  imagenHtml: plusSvgIcon,
  eliminado: false
};

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
          setTimeout(() => { this.calcularFit(); }, 50);
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500),
      )
    ;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    setTimeout(() => { this.calcularFit(); }, 100);
  }

  verTodos() {
    this.dialog.open(RubrosDialogComponent);
  }

  irAProductosConRubro(r: Rubro) {
    if (r.idRubro === 0) {
      this.verTodos();
      return;
    }
    this.router.navigate(['/productos'], { queryParams: { r: r.idRubro }});
  }

  calcularFit() {
    const containerWidth = this.container.nativeElement.offsetWidth;
    const buttonWidth = this.plusButton.nativeElement.offsetWidth + 10;

    // count: cuantos rubros entran en la pantalla
    const count = Math.floor(containerWidth / buttonWidth);

    // this.count: la cantidad de rubros calculados anteriormente
    // si la cantidad de rubros que pueden gresar en la pantalla no cambio, no hacer nada
    if (count === this.count) {
      return;
    }

    // si la cantidad de rubros es menor o igual a count, no mostrar el plus button
    if (this.rubros.length <= count) {
      this.rubrosToShow = [...this.rubros];
    } else {
      this.rubrosToShow = [...this.rubros.slice(0, count - 1), rubroMas];
    }

    this.count = count;
  }
}
