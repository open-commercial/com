import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MercadoPagoPreference} from '../../models/mercadopago/mercado-pago-preference';
import {PagosService} from '../../services/pagos.service';
import {NuevaOrdenDePago} from '../../models/nueva-orden-de-pago';
import {AvisoService} from '../../services/aviso.service';
import {MercadoPagoDialogComponent} from '../mercado-pago-dialog/mercado-pago-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'sic-com-boton-mercado-pago',
  templateUrl: './boton-mercado-pago.component.html',
  styleUrls: ['./boton-mercado-pago.component.scss']
})
export class BotonMercadoPagoComponent implements OnInit {
  loading = false;

  private _montoMinimo = 1;
  @Input()
  set montoMinimo(value: number) {
    this._montoMinimo = value;
  }

  get montoMinimo() {
    return this._montoMinimo;
  }

  private pNuevaOrdenDePago: NuevaOrdenDePago;
  @Input()
  set nuevaOrdenDePago(value: NuevaOrdenDePago) {
    this.pNuevaOrdenDePago = value;
  }

  get nuevaOrdenDePago() {
    return this.pNuevaOrdenDePago;
  }

  private pShowMontoDialog = false;
  @Input()
  set showMontoInput(value: boolean) {
    this.pShowMontoDialog = value;
  }

  get showMontoDialog() {
    return this.pShowMontoDialog;
  }

  @Output()
  preCheckout = new EventEmitter<void>();

  constructor(private pagosService: PagosService,
              private avisoService: AvisoService,
              private dialog: MatDialog) { }

  ngOnInit() {}

  goToInitPoint() {
    this.getPreference();
  }

  getPreference() {
    if (!this.pNuevaOrdenDePago) { return; }

    if (this.showMontoDialog) {
      const dialogRef = this.dialog.open(MercadoPagoDialogComponent);
      if (this.nuevaOrdenDePago.monto > 0) {
        dialogRef.componentInstance.monto = this.nuevaOrdenDePago.monto;
      }
      dialogRef.componentInstance.montoMinimo = this.montoMinimo;
      dialogRef.afterClosed().subscribe(monto => {
        if (monto) {
          this.pNuevaOrdenDePago.monto = monto;
          this.doGetPreference();
        }
      });
    } else {
      this.doGetPreference();
    }
  }

  doGetPreference() {
    this.loading = true;
    this.preCheckout.emit();
    this.pagosService.getMercadoPagoPreference(this.pNuevaOrdenDePago)
      .subscribe(
        (mpp: MercadoPagoPreference) => window.location.replace(mpp.initPoint),
        err => {
          this.loading = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      )
    ;
  }

  isDisabled() {
    if (!this.showMontoDialog) {
      return !this.nuevaOrdenDePago || this.nuevaOrdenDePago.monto < this.montoMinimo || this.loading;
    }
    return false;
  }
}
