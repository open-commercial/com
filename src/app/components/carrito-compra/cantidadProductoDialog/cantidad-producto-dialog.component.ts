import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {CarritoCompraService} from '../../../services/carrito-compra.service';
import {AvisoService} from '../../../services/aviso.service';
import {ItemCarritoCompra} from '../../../models/item-carrito-compra';
import {Producto} from '../../../models/producto';

@Component({
  selector: 'sic-com-cantidad-producto-dialog',
  templateUrl: 'cantidad-producto-dialog.component.html',
  styleUrls: ['cantidad-producto-dialog.component.scss']
})
export class CantidadProductoDialogComponent implements OnInit {

  itemCarritoCompra: ItemCarritoCompra = null;
  cantidad;
  producto: Producto;
  loading = false;

  constructor(private dialogRef: MatDialogRef<CantidadProductoDialogComponent>,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.cantidad = this.itemCarritoCompra.cantidad;
    this.producto = this.itemCarritoCompra.producto;
  }

  cambiarCantidad(cantidad, masMenos) {
    if (masMenos === 1) {
      this.cantidad = parseFloat(cantidad) + 1;
    } else {
      if (cantidad > 1) {
        this.cantidad = parseFloat(cantidad) - 1;
      } else {
        this.cantidad = 1;
      }
    }
  }

  aceptar() {
    this.loading = true;
    this.carritoCompraService.actualizarAlPedido(this.itemCarritoCompra.producto, this.cantidad).subscribe(
      () => {
        this.dialogRef.close(true);
        this.avisoService.openSnackBar('Tu carrito de compra fue modificado', '', 3500);
        this.loading = false;
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.loading = false;
      }
    );
  }
}
