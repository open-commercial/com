import {Component} from '@angular/core';
import {Producto} from '../../../models/producto';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'sic-com-agregar-al-carrito-dialog',
  templateUrl: './agregar-al-carrito-dialog.component.html',
  styleUrls: ['./agregar-al-carrito-dialog.component.scss']
})
export class AgregarAlCarritoDialogComponent {
  titulo = 'Agregar al Carrito';
  producto: Producto = null;
  cantidad = 1;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<AgregarAlCarritoDialogComponent>) {

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
    // this.loading = true;
    this.dialogRef.close(true);
    /*this.carritoCompraService.actualizarAlPedido(this.itemCarritoCompra.producto, this.cantidad).subscribe(
      () => {
        this.dialogRef.close(true);
        this.loading = false;
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.loading = false;
      }
    );*/
  }
}
