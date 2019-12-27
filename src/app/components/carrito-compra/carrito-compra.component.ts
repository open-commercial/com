import {Component, OnInit} from '@angular/core';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import { MatDialog } from '@angular/material/dialog';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {ProductosService} from '../../services/productos.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Cliente} from '../../models/cliente';
import {finalize} from 'rxjs/operators';
import {Producto} from '../../models/producto';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import {Location} from '@angular/common';
import {ItemCarritoCompra} from '../../models/item-carrito-compra';

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
  totalElements = 0;
  loadingCarritoCompra = false;
  loadingRenglones = false;
  loadingTotales = false;
  deleting = false;
  mostrarBotonAsignarCliente = true;
  cantidadArticulos = 0;
  total = 0;
  cliente: Cliente = null;

  constructor(private carritoCompraService: CarritoCompraService,
              private clientesService: ClientesService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private productosService: ProductosService,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private router: Router,
              private location: Location) {
  }

  ngOnInit() {
    this.loadingCarritoCompra = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
      (cliente: Cliente) => {
        if (cliente) {
          this.cliente = cliente;
          this.cargarItemsCarritoCompra();
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
    this.carritoCompraService.getCarritoCompra(this.cliente.idCliente)
      .pipe(
        finalize(() =>  {
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
    this.route.queryParamMap.subscribe(
      queryParams => {
        this.pagina = (Number(queryParams['params'].p) - 1) || 0;
        this.carritoCompraService.getItems(this.cliente.idCliente, this.pagina)
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
                  item.producto.urlImagen = 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1545616229/assets/sin_imagen.png';
                }
                this.itemsCarritoCompra.push(item);
              });
              this.totalPaginas = data['totalPages'];
              this.totalElements = data['totalElements'];
              this.cargarCarritoCompra();
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500));
      }
    );
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
            data => this.cargarItemsCarritoCompra(),
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

  masItemsCarritoCompra() {
    this.loadingRenglones = true;
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarItemsCarritoCompra();
    }
  }

  volver() {
    this.location.back();
  }

  goToCheckout() {
    this.router.navigate(['checkout']);
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
    return  icc.producto.precioLista > icc.producto.precioBonificado && icc.cantidad >= icc.producto.bulto;
  }
}
