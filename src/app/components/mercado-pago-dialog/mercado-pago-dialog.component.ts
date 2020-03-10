import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'sic-com-mercado-pago-dialog',
  templateUrl: './mercado-pago-dialog.component.html',
  styleUrls: ['./mercado-pago-dialog.component.scss']
})
export class MercadoPagoDialogComponent implements OnInit {
  monto = 0.00;
  montoMinimo = 10.00;
  loading = false;

  constructor(private dialogRef: MatDialogRef<MercadoPagoDialogComponent>) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit() { }

  montoChange($event) {
    const value = parseFloat($event.target.value);
    this.monto = !isNaN(value) ? value : 0;
  }

  aceptar() {
    this.dialogRef.close(this.monto);
  }
}
