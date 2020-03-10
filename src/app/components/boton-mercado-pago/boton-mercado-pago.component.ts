import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MercadoPagoPreference} from '../../models/mercadopago/mercado-pago-preference';
import {PagosService} from '../../services/pagos.service';
import {NuevaOrdenDePago} from '../../models/nueva-orden-de-pago';
import {AvisoService} from '../../services/aviso.service';

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

  @Output()
  preCheckout = new EventEmitter<void>();

  constructor(private pagosService: PagosService,
              private avisoService: AvisoService) { }

  ngOnInit() {}

  goToInitPoint() {
    this.getPreference();
  }

  getPreference() {
    if (!this.pNuevaOrdenDePago) { return; }
    this.preCheckout.emit();
    this.loading = true;
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
}
