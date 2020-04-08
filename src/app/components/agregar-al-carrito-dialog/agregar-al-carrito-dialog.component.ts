import {Component, OnInit} from '@angular/core';
import {Producto} from '../../models/producto';
import { MatDialogRef } from '@angular/material/dialog';
import {CarritoCompra} from '../../models/carrito-compra';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {Cliente} from '../../models/cliente';
import {AvisoService} from '../../services/aviso.service';
import {finalize} from 'rxjs/operators';
import {ItemCarritoCompra} from '../../models/item-carrito-compra';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'sic-com-agregar-al-carrito-dialog',
  templateUrl: './agregar-al-carrito-dialog.component.html',
  styleUrls: ['./agregar-al-carrito-dialog.component.scss']
})
export class AgregarAlCarritoDialogComponent implements OnInit {
  producto: Producto;
  cliente: Cliente;
  cantidadEnCarrito = 0;
  loading = false;

  form: FormGroup;

  constructor(private dialogRef: MatDialogRef<AgregarAlCarritoDialogComponent>,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private fb: FormBuilder) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();
    this.loading = true;
    this.carritoCompraService.getCantidadEnCarrito(this.producto.idProducto)
      .pipe(finalize(() => this.loading = false))
      .subscribe((icc: ItemCarritoCompra) => {
        this.form.get('cantidad').setValue(icc ? icc.cantidad : 1);
        this.form.get('cantidad').setValidators(
          [Validators.required, Validators.min(1), Validators.max(this.producto.cantidadTotalEnSucursales)]
        );
        this.cantidadEnCarrito = icc ? icc.cantidad : 0;
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  decCantidad() {
    let cant = this.form.get('cantidad').value ? this.form.get('cantidad').value : 1;
    if (cant > 1) { cant -= 1; }
    this.form.get('cantidad').setValue(cant);
  }

  incCantidad() {
    let cant = this.form.get('cantidad').value ? this.form.get('cantidad').value : 1;
    cant += 1;
    this.form.get('cantidad').setValue(cant);
  }

  submit() {
    if (this.form.valid) {
      const cantidad = this.form.get('cantidad').value;
      this.loading = true;
      this.carritoCompraService.actualizarAlPedido(this.producto, cantidad)
        .subscribe(
          () => {
            if (this.cliente) {
              this.carritoCompraService.getCarritoCompra(this.cliente.idCliente)
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
        )
      ;
    }
  }
  esCantidadBonificada() {
    const cant = this.form && this.form.get('cantidad') ? this.form.get('cantidad').value : null;
    if (!cant || cant < 0) { return false; }

    return this.producto.precioBonificado && this.producto.precioBonificado < this.producto.precioLista
      && cant >= this.producto.bulto;
  }
  /*esCantidadValida() {
    return this.cantidad && this.cantidad > 0 && Number(this.cantidad) === parseInt((this.cantidad).toString(), 10);
  }*/
}
