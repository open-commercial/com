import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {CarritoCompraService} from '../../../services/carrito-compra.service';
import {AvisoService} from '../../../services/aviso.service';

@Component({
  selector: 'sic-com-cantidad-producto-dialog',
  templateUrl: 'cantidad-producto-dialog.component.html',
  styleUrls: ['cantidad-producto-dialog.component.scss']
})
export class CantidadProductoDialogComponent implements OnInit {

  itemCarritoCompra = null;
  cantidad;
  loading = false;

  constructor(private dialogRef: MatDialogRef<CantidadProductoDialogComponent>,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.cantidad = this.itemCarritoCompra.cantidad;
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
      data => {
        this.itemCarritoCompra.cantidad = this.cantidad;
        this.itemCarritoCompra.importe = this.cantidad * this.itemCarritoCompra.producto.precioLista;
        this.dialogRef.close(true);
        this.loading = false;
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.loading = false;
      }
    );
  }
}
