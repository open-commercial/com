import {Component, OnInit} from '@angular/core';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {MatDialog} from '@angular/material';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {CantidadProductoDialogComponent} from './cantidadProductoDialog/cantidad-producto-dialog.component';
import {ProductosService} from '../../services/productos.service';
import {Router} from '@angular/router';
import {Cliente} from '../../models/cliente';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'sic-com-carrito-compra',
  templateUrl: './carrito-compra.component.html',
  styleUrls: ['./carrito-compra.component.scss']
})
export class CarritoCompraComponent implements OnInit {
  itemsCarritoCompra = [];
  cantidadRenglones = 0;
  pagina = 0;
  totalPaginas = 0;
  loadingCarritoCompra = false;
  loadingRenglones = false;
  loadingTotales = false;
  deleting = false;
  mostrarBotonAsignarCliente = true;
  cantidadArticulos = 0;
  subTotal = 0;
  total = 0;
  cliente: Cliente = null;

  constructor(private carritoCompraService: CarritoCompraService,
              private clientesService: ClientesService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private productosService: ProductosService,
              private dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit() {
    this.loadingCarritoCompra = true;

    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
      (cliente: Cliente) => {
        if (cliente) {
          this.cliente = cliente;
          this.cargarItemsCarritoCompra(true);
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

  vaciarCarritoCompra() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar todos los productos del carrito?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleting = true;
        this.loadingCarritoCompra = true;
        this.carritoCompraService.eliminarTodosLosItems()
          .pipe(
            finalize(() => {
              this.deleting = false;
              this.loadingCarritoCompra = false;
            })
          )
          .subscribe(
            data => {
              this.cargarCarritoCompra();
              this.cargarItemsCarritoCompra(true);
              this.carritoCompraService.setCantidadItemsEnCarrito(0);
              this.avisoService.openSnackBar('Se borraron todos los articulos del listado', '', 3500);
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      }
    });
  }

  cargarCarritoCompra() {
    this.loadingTotales = true;
    this.carritoCompraService.getCarritoCompra(this.cliente.id_Cliente)
      .pipe(
        finalize(() =>  {
          this.loadingTotales = false;
          this.loadingCarritoCompra = false;
          this.loadingRenglones = false;
        })
      )
      .subscribe(data => {
          this.cantidadArticulos = data.cantArticulos;
          this.subTotal = data.subtotal;
          this.total = data.total;
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  cargarItemsCarritoCompra(reset: boolean) {
    this.loadingRenglones = true;
    if (reset) {
      this.itemsCarritoCompra = [];
      this.pagina = 0;
    }
    this.carritoCompraService.getItems(this.cliente.id_Cliente, this.pagina)
      .pipe(
        finalize(() => {
          this.loadingRenglones = false;
          this.loadingCarritoCompra = false;
        })
      )
      .subscribe(
        data => {
          data['content'].forEach(item => {
            if (item.producto.urlImagen == null || item.producto.urlImagen === '') {
              item.producto.urlImagen = 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1545616229/assets/sin_imagen.png';
            }
            this.itemsCarritoCompra.push(item);
          });
          this.totalPaginas = data['totalPages'];
          if (reset) {
            this.cargarCarritoCompra();
          }
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  precioListaBonificado(item) {
    return item.producto.precioLista - (item.producto.precioLista * this.cliente.bonificacion / 100);
  }

  precioImporteBonificado(item) {
    return item.importe - (item.importe * this.cliente.bonificacion / 100);
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
          .pipe(
            finalize(() => {
              this.deleting = false;
            })
          )
          .subscribe(
            data => {
              this.avisoService.openSnackBar('Se eliminó el articulo del listado', '', 3500);
              this.cargarItemsCarritoCompra(true);
              this.carritoCompraService.setCantidadItemsEnCarrito(this.itemsCarritoCompra.length);
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      }
    });
  }

  editCantidadProducto(itemCarritoCompra) {
    const dialogRef = this.dialog.open(CantidadProductoDialogComponent);
    dialogRef.componentInstance.itemCarritoCompra = itemCarritoCompra;
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loadingCarritoCompra = true;
        this.cargarItemsCarritoCompra(true);
      }
    });
  }

  masItemsCarritoCompra() {
    this.loadingRenglones = true;
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarItemsCarritoCompra(false);
    }
  }

  irAlListado() {
    const criteria = this.productosService.getBusquedaCriteria();
    this.router.navigate(['/productos', {q: criteria}]);
  }

  goToCheckout() {
    this.router.navigate(['checkout']);
  }

  disabledButtons() {
    return this.loadingRenglones || this.deleting;
  }
}
