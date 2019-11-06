import {Component, OnInit} from '@angular/core';
import {Producto} from '../../models/producto';
import { MatDialogRef } from '@angular/material/dialog';
import {CarritoCompra} from '../../models/carrito-compra';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {Cliente} from '../../models/cliente';
import {AvisoService} from '../../services/aviso.service';
import {finalize} from 'rxjs/operators';
import {ItemCarritoCompra} from '../../models/item-carrito-compra';
import {Router} from '@angular/router';
import {formatNumber} from '@angular/common';

@Component({
  selector: 'sic-com-agregar-al-carrito-dialog',
  templateUrl: './agregar-al-carrito-dialog.component.html',
  styleUrls: ['./agregar-al-carrito-dialog.component.scss']
})
export class AgregarAlCarritoDialogComponent implements OnInit {
  producto: Producto;
  cliente: Cliente;
  cantidad = 1;
  cantidadEnCarrito = 0;
  loading = false;

  constructor(private dialogRef: MatDialogRef<AgregarAlCarritoDialogComponent>,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private router: Router) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.loading = true;
    this.carritoCompraService.getCantidadEnCarrito(this.producto.idProducto)
      .pipe(finalize(() => this.loading = false))
      .subscribe((icc: ItemCarritoCompra) => {
        this.cantidad = icc ? icc.cantidad : 1;
        this.cantidadEnCarrito = icc ? icc.cantidad : 0;
      })
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
    if (!this.esCantidadValida()) { return; }
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
  esCantidadBonificada() {
    return this.producto.precioListaBonificado && this.producto.precioListaBonificado !== this.producto.precioLista
      && this.cantidad >= this.producto.bulto;
  }
  esCantidadValida() {
    return this.cantidad && this.cantidad > 0 && Number(this.cantidad) === parseInt((this.cantidad).toString(), 10);
  }
}
