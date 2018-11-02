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
import {forkJoin} from 'rxjs';

@Component({
  selector: 'sic-com-carrito-compra',
  templateUrl: './carrito-compra.component.html',
  styleUrls: ['./carrito-compra.component.scss']
})
export class CarritoCompraComponent implements OnInit {
  itemsCarritoCompra = [];
  cantidadRenglones = 0;
  pagina = 0;
  tamanioPagina = 10;
  totalPaginas = 0;
  loadingPedido = false;
  loadingRenglones = false;
  mostrarBotonAsignarCliente = true;

  cantidadArticulos: Number = 0;
  subTotal: Number = 0;

  constructor(private carritoCompraService: CarritoCompraService,
              private clientesService: ClientesService,
              private dialog: MatDialog,
              private avisoService: AvisoService,
              private authService: AuthService,
              private productosService: ProductosService,
              private router: Router) {
  }

  ngOnInit() {
    this.loadingPedido = true;
    this.cargarPedido();

    this.carritoCompraService.getCantidadRenglones().subscribe(
      data => {
        this.cantidadRenglones = Number(data);
        this.carritoCompraService.setCantidadItemsEnCarrito(Number(data));
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  vaciarPedido() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar todos los productos del carrito?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carritoCompraService.eliminarTodosLosItems().subscribe(
          data => {
            this.sumarSubTotal();
            this.itemsCarritoCompra = [];
            this.carritoCompraService.setCantidadItemsEnCarrito(0);
            this.avisoService.openSnackBar('Se borraron todos los articulos del listado', '', 3500);
          },
          err => this.avisoService.openSnackBar(err.error, '', 3500));
      }
    });
  }

  cargarPedido() {
    this.carritoCompraService.getItems(this.pagina, this.tamanioPagina).subscribe(
      data => {
        data['content'].forEach(item => this.itemsCarritoCompra.push(item));
        this.totalPaginas = data['totalPages'];
        this.sumarSubTotal();
        this.loadingPedido = false;
        this.loadingRenglones = false;
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  sumarSubTotal() {
    forkJoin(
      this.carritoCompraService.getCantidadArticulos(),
      this.carritoCompraService.getSubtotalImportePedido()
    ).subscribe(data => {
      this.cantidadArticulos = data[0];
      this.subTotal = data[1];
    });
  }

  eliminarItemDelCarrito(itemCarritoCompra) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.componentInstance.titulo = '¿Está seguro de quitar el producto?';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carritoCompraService.eliminarItem(itemCarritoCompra.producto.id_Producto).subscribe(
          data => {
            this.avisoService.openSnackBar('Se eliminó el articulo del listado', '', 3500);
            this.sumarSubTotal();
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
        this.sumarSubTotal();
      }
    });
  }

  masProductosPedido() {
    this.loadingRenglones = true;
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarPedido();
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
