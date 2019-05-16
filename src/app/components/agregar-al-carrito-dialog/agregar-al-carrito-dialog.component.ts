import {Component, OnInit} from '@angular/core';
import {Producto} from '../../models/producto';
import {MatDialogRef} from '@angular/material';
import {CarritoCompra} from '../../models/carrito-compra';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {Cliente} from '../../models/cliente';
import {AvisoService} from '../../services/aviso.service';
import {finalize} from 'rxjs/operators';
import {ItemCarritoCompra} from '../../models/item-carrito-compra';

@Component({
  selector: 'sic-com-agregar-al-carrito-dialog',
  templateUrl: './agregar-al-carrito-dialog.component.html',
  styleUrls: ['./agregar-al-carrito-dialog.component.scss']
})
export class AgregarAlCarritoDialogComponent implements OnInit {
  producto: Producto;
  cliente: Cliente;
  cantidad = 1;
  loading = false;

  constructor(private dialogRef: MatDialogRef<AgregarAlCarritoDialogComponent>,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.loading = true;
    this.carritoCompraService.getCantidadEnCarrito(this.producto.idProducto)
      .pipe(finalize(() => this.loading = false))
      .subscribe((icc: ItemCarritoCompra) => this.cantidad = icc ? icc.cantidad : 1)
    ;
  }

  menosUno(cantidad) {
    if (cantidad > 1) {
      this.cantidad = parseFloat(cantidad) - 1;
    } else {
      this.cantidad = 1;
    }
  }

  masUno(cantidad) {
    this.cantidad = parseFloat(cantidad) + 1;
  }

  aceptar() {
    this.loading = true;
    this.carritoCompraService.actualizarAlPedido(this.producto, this.cantidad)
      .subscribe(
        data => {
          if (this.cliente) {
            this.carritoCompraService.getCarritoCompra(this.cliente.id_Cliente)
              .subscribe(
                (carrito: CarritoCompra) => {
                  this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones);
                  this.loading = false;
                  this.dialogRef.close(true);
                  this.avisoService.openSnackBar('Tu carrito de compra fué modificado', '', 3500);
                },
                err => {
                  this.avisoService.openSnackBar(err.error, '', 3500);
                  this.loading = false;
                }
              );
          }
        },
        err => {
          this.loading = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }
}
