import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AvisoService } from '../../services/aviso.service';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { AgregarAlCarritoDialogComponent } from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import { Cliente } from '../../models/cliente';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import { MatDialog } from '@angular/material/dialog';
import { Producto } from '../../models/producto';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'sic-com-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss']
})
export class FavoritosComponent implements OnInit {
  loading = false;
  cliente: Cliente = null;
  productos = [];
  totalPaginas = 0;
  totalElements = 0;
  pagina = 0;

  constructor(private productosService: ProductosService,
              private route: ActivatedRoute,
              private router: Router,
              private clientesService: ClientesService,
              private authService: AuthService,
              private avisoService: AvisoService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      let p = Number(params.get('p'));

      p = isNaN(p) ? 1 : (p < 1 ? 1 : p);
      this.pagina = p - 1;

      this.loading = true;
      this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
        .subscribe(
        (cliente: Cliente) => {
            if (cliente) {
              this.cliente = cliente;
              this.cargarProductosFavoritos();
            } else {
              this.avisoService.openSnackBar('El usuario no posee cliente asociado');
              this.router.navigate(['']);
              this.loading = false;
            }
          },
          err => {
            this.avisoService.openSnackBar(err.error);
            this.router.navigate(['']);
            this.loading = false;
          },
        )
      ;
    });
  }

  cargarProductosFavoritos() {
    this.loading = true;
    this.productos = [];
    this.productosService.getProductosFavoritos(this.pagina)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (data: Pagination) => {
          this.productos = data['content'];
          this.totalPaginas = data['totalPages'];
          this.totalElements = data['totalElements'];
        },
        err => {
          this.avisoService.openSnackBar(err.error);
          this.router.navigate(['']);
        }
      )
    ;
  }

  showDialogCantidad($event, producto: Producto) {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    $event.stopPropagation();
    dialogRef.componentInstance.producto = producto;
    dialogRef.componentInstance.cliente = this.cliente;
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.cargarProductosFavoritos();
      }
    });
  }

  quitarDeFavorito(producto: Producto) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar este producto de tus favoritos?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.productosService.quitarProductoDeFavorito(producto.idProducto)
          .pipe(finalize(() => this.loading = false))
          .subscribe(
            () => this.cargarProductosFavoritos(),
            err => this.avisoService.openSnackBar(err.error),
          )
        ;
      }
    });
  }

  vaciarFavoritos() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar todos los productos de tus favoritos?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.productosService.quitarTodosDeFavoritos()
          .pipe(finalize(() => this.loading = false))
          .subscribe(
            () => this.cargarProductosFavoritos(),
            err => this.avisoService.openSnackBar(err.error),
          )
        ;
      }
    });
  }

  paginaAnterior() {
    if (this.pagina <= 0) { return; }
    this.router.navigate(['/productos/favoritos'], { queryParams: { p: this.pagina } });
  }

  paginaSiguiente() {
    if (this.pagina + 1 >= this.totalPaginas) { return; }
    this.router.navigate(['/productos/favoritos'], { queryParams: { p: this.pagina + 2 } });
  }
}
