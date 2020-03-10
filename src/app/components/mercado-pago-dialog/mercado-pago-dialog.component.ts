import {Component, OnInit} from '@angular/core';
import {NuevaOrdenDePago} from '../../models/nueva-orden-de-pago';
import {Movimiento} from '../../models/movimiento';
import {environment} from '../../../environments/environment';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'sic-com-mercado-pago-dialog',
  templateUrl: './mercado-pago-dialog.component.html',
  styleUrls: ['./mercado-pago-dialog.component.scss']
})
export class MercadoPagoDialogComponent implements OnInit {
  monto = 0.00;
  loading = false;

  nuevaOrdenDePago: NuevaOrdenDePago = {
    movimiento: Movimiento.DEPOSITO,
    idSucursal: environment.idSucursal,
    tipoDeEnvio: null,
    monto: null,
  };

  constructor(private dialogRef: MatDialogRef<MercadoPagoDialogComponent>) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit() { }

  montoChange($event) {
    const value = parseFloat($event.target.value);
    this.nuevaOrdenDePago.monto = !isNaN(value) ? value : 0;
  }
}
