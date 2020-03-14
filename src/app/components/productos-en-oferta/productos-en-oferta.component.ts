import {Component, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {Producto} from '../../models/producto';
import {AuthService} from '../../services/auth.service';
import {finalize} from 'rxjs/operators';
import {AvisoService} from '../../services/aviso.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'sic-com-productos-en-oferta',
  templateUrl: 'productos-en-oferta.component.html',
  styleUrls: ['./productos-en-oferta.component.scss']
})
export class ProductosEnOfertaComponent implements OnInit {

  cliente: Cliente;
  enOferta: Producto[] = [];
  firstLoading = false;
  loading = false;
  totalPaginas = 0;
  pagina = 0;

  constructor(private productosService: ProductosService,
              private authService: AuthService,
              private clienteService: ClientesService,
              private avisoService: AvisoService) {}

  ngOnInit(): void {
    this.firstLoading = true;
    this.cargarProductos();
    if (this.authService.isAuthenticated()) {
      this.clienteService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
        .subscribe((c: Cliente) => this.cliente = c);
    }
  }

  cargarProductos() {
    this.loading = true;
    this.productosService.getProductosEnOferta(this.pagina)
      .pipe(finalize(() => { this.loading = false; this.firstLoading = false; }))
      .subscribe(
        (data) => {
          data['content'] = this.shuffle(data['content']);
          data['content'].forEach(p => this.enOferta.push(p));
          this.totalPaginas = data['totalPages'];
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );
  }

  paginaSiguiente() {
    this.pagina += 1;
    this.cargarProductos();
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
