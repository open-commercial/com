import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {AvisoService} from '../../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'email-dialog',
  templateUrl: 'email-dialog.component.html',
})
export class EmailDialogComponent implements OnInit {

  private emailForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<EmailDialogComponent>,
              private avisoService: AvisoService, private fb: FormBuilder) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // incrementarCantidad() {
  //   let value = parseInt(this.cantidadForm.get('cantidad').value, 10);
  //   if (isNaN(value)) {
  //     value = this.minValue;
  //   } else {
  //     value += 1;
  //   }
  //   this.cantidadForm.get('cantidad').setValue(value);
  // }
  //
  // decrementarCantidad() {
  //   let value = parseInt(this.cantidadForm.get('cantidad').value, 10);
  //   if (isNaN(value)) {
  //     value = this.minValue;
  //   }
  //   if (value > this.minValue) {
  //     value -= 1;
  //   }
  //   this.cantidadForm.get('cantidad').setValue(value);
  // }
  //
  // deshabilitarBottonDecrementar() {
  //   const value = parseInt(this.cantidadForm.get('cantidad').value, 10);
  //   return isNaN(value) || value <= this.minValue;
  // }

  save() {
    if (this.emailForm.valid) {
      const email = this.emailForm.get('email').value;

      // this.dialogRef.close(email);
      /*this.carritoCompraService.actualizarAlPedido(this.itemCarritoCompra.producto, this.cantidad).subscribe(
        data => {
          this.itemCarritoCompra.cantidad = this.cantidad;
          this.itemCarritoCompra.importe = this.cantidad * this.itemCarritoCompra.producto.precioLista;
          this.dialogRef.close(true);
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );*/
    }
  }
}
