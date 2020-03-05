import {Component, Input, OnInit} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {MercadoPagoPreference} from '../../models/mercadopago/mercado-pago-preference';
import {PagosService} from '../../services/pagos.service';
import {NuevaOrdenDeCompra} from '../../models/nueva-orden-de-compra';
import {TipoDeEnvio} from '../../models/tipo-de-envio';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'sic-com-boton-mercado-pago',
  templateUrl: './boton-mercado-pago.component.html',
  styleUrls: ['./boton-mercado-pago.component.scss']
})
export class BotonMercadoPagoComponent implements OnInit {
  idPreference = '';
  initPoint = '';
  loading = false;

  private pTipoDeEnvio: TipoDeEnvio;

  @Input()
  set tipoDeEnvio(value: TipoDeEnvio) {
    this.pTipoDeEnvio = value;
    this.getPreference();
  }

  get tipoDeEnvio(): TipoDeEnvio {
    return this.pTipoDeEnvio;
  }

  constructor(private pagosService: PagosService) { }

  ngOnInit() {}

  getPreference() {
    const npmp: NuevaOrdenDeCompra = {
      idSucursal: environment.idSucursal,
      tipoDeEnvio: this.pTipoDeEnvio
    };

    this.loading = true;
    this.pagosService.getMercadoPagoPreference(npmp)
      .pipe(finalize(() => this.loading = false))
      .subscribe((mpp: MercadoPagoPreference) => {
        this.idPreference = mpp.id;
        this.initPoint = mpp.initPoint;
      })
    ;
  }
}
