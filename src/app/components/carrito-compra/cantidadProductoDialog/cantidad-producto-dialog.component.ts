import {Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { CarritoCompraService } from '../../../services/carrito-compra.service';
import { AvisoService } from '../../../services/aviso.service';

@Component({
    selector: 'sic-com-cantidad-producto-dialog',
    templateUrl: 'cantidad-producto-dialog.component.html',
})
export class CantidadProductoDialogComponent implements OnInit {
    itemCarritoCompra = null;
    cantidad = 0;

    constructor(
        private dialogRef: MatDialogRef<CantidadProductoDialogComponent>,
        private carritoCompraService: CarritoCompraService,
        private avisoService: AvisoService
    ) {}

    ngOnInit() {
        this.cantidad = this.itemCarritoCompra.cantidad;
    }

    save() {
        console.log(this.itemCarritoCompra.cantidad, this.cantidad);
        this.carritoCompraService.agregarQuitarAlPedido(this.itemCarritoCompra.producto, this.cantidad).subscribe(
            data => {
              this.itemCarritoCompra.descuento_porcentaje = 0;
              this.itemCarritoCompra.descuento_neto = 0;
              this.itemCarritoCompra.subTotal = this.cantidad * this.itemCarritoCompra.producto.precioLista;
              // this.sumarTotales();
              this.dialogRef.close(this.itemCarritoCompra);
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
        );
    }
}
