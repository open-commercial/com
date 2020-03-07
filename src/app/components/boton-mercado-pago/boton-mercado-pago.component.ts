import {Component, Input, OnInit} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {MercadoPagoPreference} from '../../models/mercadopago/mercado-pago-preference';
import {PagosService} from '../../services/pagos.service';
import {NuevaOrdenDePago} from '../../models/nueva-orden-de-pago';

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

  constructor(private pagosService: PagosService) { }

  ngOnInit() {}

  goToInitPoint() {
    this.getPreference();
  }

  getPreference() {
    if (!this.pNuevaOrdenDePago) { return; }
    this.loading = true;
    this.pagosService.getMercadoPagoPreference(this.pNuevaOrdenDePago)
      .pipe(finalize(() => setTimeout(() => this.loading = false, 250)))
      .subscribe((mpp: MercadoPagoPreference) => {
        window.location.replace(mpp.initPoint);
      })
    ;
  }
}
