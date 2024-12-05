import { Component, OnInit } from '@angular/core';
import { CarritoCompraService } from '../../services/carrito-compra.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientesService } from '../../services/clientes.service';
import { AvisoService } from '../../services/aviso.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from '../../models/cliente';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { AgregarAlCarritoDialogComponent } from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import { ItemCarritoCompra } from '../../models/item-carrito-compra';
import { ProductoFaltante } from '../../models/producto-faltante';

@Component({
  selector: 'sic-com-carrito-compra',
  templateUrl: './carrito-compra.component.html',
  styleUrls: ['./carrito-compra.component.scss']
})
export class CarritoCompraComponent implements OnInit {
  itemsCarritoCompra = [];
  pagina = 0;
  totalPaginas = 0;
  totalElements = 0;
  loadingCarritoCompra = false;
  loadingRenglones = false;
  loadingTotales = false;
  deleting = false;
  cantidadArticulos = 0;
  total = 0;
  cliente: Cliente = null;
  verificandoStock = false;
  vsForzado = true;

  constructor(private readonly carritoCompraService: CarritoCompraService,
              private readonly clientesService: ClientesService,
              private readonly avisoService: AvisoService,
              private readonly authService: AuthService,
              private readonly dialog: MatDialog,
              private readonly route: ActivatedRoute,
              private readonly router: Router) {
  }

  ngOnInit() {
    this.loadingCarritoCompra = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
      (cliente: Cliente) => {
        if (cliente) {
          this.cliente = cliente;
          this.loadingCarritoCompra = false;
          this.route.queryParamMap.subscribe(
            queryParams => {
              let auxp = Number(queryParams.get('p'));
              auxp = isNaN(auxp) ? 1 : (auxp < 1 ? 1 : auxp);
              this.pagina = auxp - 1;
              this.cargarItemsCarritoCompra();
              if (this.vsForzado) {
                this.verificarStock((faltantes: ProductoFaltante[]) => {
                  this.verificandoStock = false;
                  if (faltantes.length) {
                    const msg = 'No hay stock disponible para algunos productos. Revise el carrito';
                    this.avisoService.openSnackBar(msg, 'Cerrar', 0);
                  }
                });
              }
            }
          );
        } else {
          this.loadingCarritoCompra = false;
        }
      },
      err => {
        this.loadingCarritoCompra = false;
        this.avisoService.openSnackBar(err.error, '', 3500);
      }
    );
  }

  verificarStock(callback: (faltantes: ProductoFaltante[]) => void) {
    this.verificandoStock = true;
    this.vsForzado = false;
    this.carritoCompraService.getDisponibilidadStock()
      .subscribe(
        callback,
        err => {
          this.verificandoStock = false;
          this.avisoService.openSnackBar(err.error, 'Cerrar', 0);
        }
      )
    ;
  }

  reloadPage() {
    this.vsForzado = true;
    this.router.navigate(['/carrito-compra'], { queryParams: { p: this.pagina, refresh: new Date().getTime() }});
  }

  vaciarCarritoCompra() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar todos los productos del carrito?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleting = true;
        this.loadingCarritoCompra = true;
        this.carritoCompraService.eliminarTodosLosItems()
          .pipe(finalize(() => {
            this.deleting = false;
            this.loadingCarritoCompra = false;
          }))
          .subscribe(
            () => {
              this.cargarCarritoCompra();
              this.cargarItemsCarritoCompra();
              this.carritoCompraService.setCantidadItemsEnCarrito(0);
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      }
    });
  }

  cargarCarritoCompra() {
    this.loadingTotales = true;
    this.carritoCompraService.getCarritoCompra()
      .pipe(finalize(() => {
        this.loadingTotales = false;
        this.loadingCarritoCompra = false;
        this.loadingRenglones = false;
      })
      )
      .subscribe(data => {
        this.cantidadArticulos = data.cantArticulos;
        this.total = data.total;
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  cargarItemsCarritoCompra() {
    this.loadingRenglones = true;
    this.carritoCompraService.getItems(this.pagina)
      .pipe(finalize(() => {
        this.loadingRenglones = false;
        this.loadingCarritoCompra = false;
        this.carritoCompraService.setCantidadItemsEnCarrito(this.totalElements);
      }))
      .subscribe(
        data => {
          this.itemsCarritoCompra = [];
          data['content'].forEach(item => {
            if (item.producto.urlImagen == null || item.producto.urlImagen === '') {
              item.producto.urlImagen = 'assets/images/sin_imagen.png';
            }
            this.itemsCarritoCompra.push(item);
          });
          this.totalPaginas = data['totalPages'];
          this.totalElements = data['totalElements'];
          this.cargarCarritoCompra();
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      )
    ;
  }

  eliminarItemDelCarrito(itemCarritoCompra) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar el producto?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleting = true;
        this.loadingCarritoCompra = true;
        this.loadingTotales =  true;
        this.carritoCompraService.eliminarItem(itemCarritoCompra.producto.idProducto)
          .pipe(finalize(() => this.deleting = false))
          .subscribe(
            () => this.cargarItemsCarritoCompra(),
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      }
    });
  }

  showDialogCantidad($event, producto: Producto) {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    $event.stopPropagation();
    dialogRef.componentInstance.producto = producto;
    dialogRef.componentInstance.cliente = this.cliente;
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loadingCarritoCompra = true;
        this.cargarItemsCarritoCompra();
      }
    });
  }

  volver() {
    this.router.navigate(['']);
  }

  goToCheckout() {
    this.verificarStock((faltantes: ProductoFaltante[]) => {
      if (faltantes.length) {
        this.reloadPage();
      } else {
        this.router.navigate(['/checkout']);
      }
    });
  }

  disabledButtons() {
    return this.loadingRenglones || this.deleting;
  }

  paginaAnterior() {
    if (this.pagina <= 0) { return; }
    this.router.navigate(['/carrito-compra'], { queryParams: { p: this.pagina } });
  }

  paginaSiguiente() {
    if (this.pagina + 1 >= this.totalPaginas) { return; }
    this.router.navigate(['/carrito-compra'], { queryParams: { p: this.pagina + 2 } });
  }

  estaBonificado(icc: ItemCarritoCompra) {
    return  icc.producto.precioLista > icc.producto.precioBonificado && icc.cantidad >= icc.producto.cantMinima;
  }
}
