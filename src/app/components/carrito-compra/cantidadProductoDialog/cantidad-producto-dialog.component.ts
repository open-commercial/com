import {Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { CarritoCompraService } from '../../../services/carrito-compra.service';
import { AvisoService } from '../../../services/aviso.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'sic-com-cantidad-producto-dialog',
    templateUrl: 'cantidad-producto-dialog.component.html',
})
export class CantidadProductoDialogComponent implements OnInit {
    itemCarritoCompra = null;
    cantidad = 0;
    minValue = 0;
    cantidadForm: FormGroup;

    constructor(
        private dialogRef: MatDialogRef<CantidadProductoDialogComponent>,
        private carritoCompraService: CarritoCompraService,
        private avisoService: AvisoService,
        private fb: FormBuilder
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {
        this.cantidad = this.itemCarritoCompra.cantidad;
        this.minValue = this.itemCarritoCompra.producto.ventaMinima;
        this.buildForm();
    }

    buildForm() {
        this.cantidadForm = this.fb.group({
            cantidad: [this.cantidad, [Validators.required, Validators.min(this.minValue)]]
        });
    }

    incrementarCantidad() {
        let value = parseInt(this.cantidadForm.get('cantidad').value, 10);
        if (!isNaN(value)) {
            value += 1;
            this.cantidadForm.get('cantidad').setValue(value);
        }
    }

    decrementarCantidad() {
        let value = parseInt(this.cantidadForm.get('cantidad').value, 10);
        if (!isNaN(value) && value > 0) {
            value -= 1;
            this.cantidadForm.get('cantidad').setValue(value);
        }
    }

    save() {
        if (this.cantidadForm.valid) {
            this.cantidad = this.cantidadForm.get('cantidad').value;
            this.carritoCompraService.actualizarAlPedido(this.itemCarritoCompra.producto, this.cantidad).subscribe(
                data => {
                  this.itemCarritoCompra.cantidad = this.cantidad;
                  this.itemCarritoCompra.importe = this.cantidad * this.itemCarritoCompra.producto.precioLista;
                  this.dialogRef.close(true);
                },
                err => this.avisoService.openSnackBar(err.error, '', 3500)
            );
        }
    }
}
