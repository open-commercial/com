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
          this.cargarItemsCarritoCompra();
        }
        this.loadingCarritoCompra = false;
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
        this.carritoCompraService.eliminarTodosLosItems().subscribe(
          data => {
            this.cargarCarritoCompra();
            this.itemsCarritoCompra = [];
            this.carritoCompraService.setCantidadItemsEnCarrito(0);
            this.avisoService.openSnackBar('Se borraron todos los articulos del listado', '', 3500);
          },
          err => this.avisoService.openSnackBar(err.error, '', 3500));
      }
    });
  }

  cargarCarritoCompra() {
    this.carritoCompraService.getCarritoCompra(this.cliente.id_Cliente)
      .subscribe(data => {
          this.cantidadArticulos = data.cantArticulos;
          this.subTotal = data.subtotal;
          this.total = data.total;
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  cargarItemsCarritoCompra() {
    this.carritoCompraService.getItems(this.cliente.id_Cliente, this.pagina)
      .subscribe(
        data => {
          data['content'].forEach(item => this.itemsCarritoCompra.push(item));
          this.totalPaginas = data['totalPages'];
          this.cargarCarritoCompra();
          this.loadingCarritoCompra = false;
          this.loadingRenglones = false;
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
        this.carritoCompraService.eliminarItem(itemCarritoCompra.producto.idProducto).subscribe(
          data => {
            this.avisoService.openSnackBar('Se eliminó el articulo del listado', '', 3500);
            this.cargarCarritoCompra();
            const id = this.itemsCarritoCompra.map(function (e) {
              return e;
            }).indexOf(itemCarritoCompra);
            this.itemsCarritoCompra.splice(id, 1);
            this.carritoCompraService.setCantidadItemsEnCarrito(this.itemsCarritoCompra.length);
          },
          err => this.avisoService.openSnackBar(err.error, '', 3500));
      }
    });
  }

  editCantidadProducto(itemCarritoCompra) {
    const dialogRef = this.dialog.open(CantidadProductoDialogComponent);
    dialogRef.componentInstance.itemCarritoCompra = itemCarritoCompra;
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.cargarCarritoCompra();
      }
    });
  }

  masItemsCarritoCompra() {
    this.loadingRenglones = true;
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarItemsCarritoCompra();
    }
  }

  irAlListado() {
    const criteria = this.productosService.getBusquedaCriteria();
    this.router.navigate(['/productos', {busqueda: criteria}]);
  }

  goToCheckout() {
    this.router.navigate(['checkout']);
  }
}
