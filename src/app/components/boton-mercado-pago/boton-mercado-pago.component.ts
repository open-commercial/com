import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {finalize} from 'rxjs/operators';
import {MercadoPagoPreference} from '../../models/mercadopago/mercado-pago-preference';

@Component({
  selector: 'sic-com-boton-mercado-pago',
  templateUrl: './boton-mercado-pago.component.html',
  styleUrls: ['./boton-mercado-pago.component.scss']
})
export class BotonMercadoPagoComponent implements OnInit {
  idPreference = '';
  initPoint = '';
  loading = false;

  @ViewChild('mpForm', { static: false }) mpForm: ElementRef;

  constructor(private carritoCompraService: CarritoCompraService,
              private renderer2: Renderer2) { }

  ngOnInit() {
    this.loading = true;
    this.carritoCompraService.getMercadoPagoPreference()
      .pipe(finalize(() => this.loading = false))
      .subscribe((mpp: MercadoPagoPreference) => {
        this.idPreference = mpp.id;
        this.initPoint = mpp.initPoint;
        // setTimeout(() => this.addButtonScript(), 2000);
        // this.addButtonScript();
      })
    ;
  }

  /*addButtonScript() {
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://www.mercadopago.com.ar/integrations/v1/web-payment-checkout.js';
    s.setAttribute('data-preference-id', this.idPreference);
    this.renderer2.appendChild(this.mpForm.nativeElement, s);
  }*/
}
