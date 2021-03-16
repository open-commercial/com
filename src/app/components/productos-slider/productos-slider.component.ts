import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {Producto} from '../../models/producto';
import {AuthService} from '../../services/auth.service';
import {finalize} from 'rxjs/operators';
import {AvisoService} from '../../services/aviso.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';

@Component({
  selector: 'sic-com-productos-slider',
  templateUrl: 'productos-slider.component.html',
  styleUrls: ['./productos-slider.component.scss']
})
export abstract class ProductosSliderComponent implements OnInit {

  cliente: Cliente;
  productos: Producto[] = [];
  firstLoading = false;
  loading = false;
  totalPaginas = 1;
  pagina = 0;

  interval = null;
  intervalTime = 10;

  cardWidth = 0;
  visibleCardsCount = 0;

  scrolling = false;

  @ViewChild('cardsContainer', { static: false }) cardsContainer: ElementRef;

  protected constructor(protected productosService: ProductosService,
              protected authService: AuthService,
              protected clienteService: ClientesService,
              protected avisoService: AvisoService) {}

  abstract getProductosObservableMethod(pagina: number): Observable<Pagination>;

  ngOnInit(): void {
    this.firstLoading = true;
    this.cargarMasProductos();
    if (this.authService.isAuthenticated()) {
      this.clienteService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
        .subscribe((c: Cliente) => this.cliente = c);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.calcularFit();
  }

  cargarMasProductos() {
    if (this.pagina < this.totalPaginas) {
      this.pagina += 1;
    } else { return; }

    this.loading = true;
    this.scrolling = true;
    // this.productosService.getProductosEnOferta(this.pagina)
    this.getProductosObservableMethod(this.pagina)
      .pipe(finalize(() => { this.loading = false; this.firstLoading = false; }))
      .subscribe(
        (data) => {
          data['content'] = this.shuffle(data['content']);
          data['content'].forEach(p => this.productos.push(p));
          this.totalPaginas = data['totalPages'];
          if (this.cardsContainer && this.pagina > 1 && data['content'].length) {
            setTimeout(() => { this.scroll(1); }, 800);
          } else {
            this.scrolling = false;
          }
        },
        err => {
          this.scrolling = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      )
    ;
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  calcularFit() {
    clearInterval(this.interval);
    const cards = this.cardsContainer.nativeElement.getElementsByTagName('sic-com-producto-card');
    this.cardWidth = cards.length ? cards[0].offsetWidth : 0;

    if (this.cardWidth > 0 && this.cardWidth <= this.cardsContainer.nativeElement.offsetWidth) {
      this.visibleCardsCount = this.cardWidth > 0 ? Math.floor(this.cardsContainer.nativeElement.offsetWidth / this.cardWidth) : 0;
    } else {
      this.visibleCardsCount = 1;
    }
  }

  scroll(dir = 1) {
    this.calcularFit();
    if (this.visibleCardsCount === 0) { return; }
    if (dir !== 1 && dir !== -1) { return; }

    this.scrolling = true;
    const step = Math.floor(this.cardsContainer.nativeElement.offsetWidth / 10);
    let i = this.cardsContainer.nativeElement.scrollLeft;
    const toScroll = i + this.visibleCardsCount * this. cardWidth * dir;

    i += dir * step;
    this.cardsContainer.nativeElement.scrollLeft = i;

    this.interval = setInterval(() => {
      i += dir * step;
      const endCondition = dir > 0 ? i >= toScroll : i <= toScroll;
      if (endCondition) {
        i = toScroll;
        clearInterval(this.interval);
        this.scrolling = false;
      }
      this.cardsContainer.nativeElement.scrollLeft = i;
    }, this.intervalTime);
  }

  scrollRight() {
    const c = this.cardsContainer.nativeElement;
    const eos = c.offsetWidth + c.scrollLeft >= c.scrollWidth;
    if (eos) {
      this.cargarMasProductos();
    } else {
      this.scroll(1);
    }
  }

  scrollLeft() {
    this.scroll(-1);
  }
}
