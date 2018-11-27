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
import {Usuario} from '../../models/usuario';
import {Cliente} from '../../models/cliente';
import {CarritoCompra} from '../../models/carrito-compra';

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
  usuario: Usuario = null;
  clienteDeUsuario: Cliente = null;
  cliente: Cliente = null;
  carritoCompra: CarritoCompra;

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
    this.cargarItemsCarritoCompra();


    this.authService.getLoggedInUsuario().subscribe(
      (usuario: Usuario) => {
        if (usuario) {
          this.usuario = usuario;
          this.clientesService.getClienteDelUsuario(this.usuario.id_Usuario).subscribe(
            (cliente: Cliente) => {
              if (cliente) {
                this.clienteDeUsuario = cliente;
                this.cliente = cliente;
              }
              this.loadingCarritoCompra = false;
            },
            err => {
              this.loadingCarritoCompra = false;
              this.avisoService.openSnackBar(err.error, '', 3500);
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




    /*this.carritoCompraService.getCantidadRenglones().subscribe(
      data => {
        this.cantidadRenglones = Number(data);
        this.carritoCompraService.setCantidadItemsEnCarrito(Number(data));
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));*/
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
    this.carritoCompraService.getCarritoCompra(this.clienteDeUsuario.id_Cliente)
      .subscribe(data => {
          this.cantidadArticulos = data.cantArticulos;
          this.subTotal = data.subtotal;
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  cargarItemsCarritoCompra() {
    this.carritoCompraService.getItems(this.pagina)
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
