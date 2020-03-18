import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {NuevoPagoMercadoPago} from '../models/mercadopago/nuevo-pago-mercado-pago';
import {NuevaOrdenDePago} from '../models/nueva-orden-de-pago';
import {MercadoPagoPreference} from '../models/mercadopago/mercado-pago-preference';


@Injectable()
export class PagosService {

  url = environment.apiUrl + '/api/v1/pagos';

  constructor(private http: HttpClient) {}

  generarMPPago(pago: NuevoPagoMercadoPago): Observable<boolean> {
    return this.http.post<boolean>(this.url + '/mercado-pago', pago);
  }

  getMercadoPagoPreference(nuevaOrdenDePago: NuevaOrdenDePago): Observable<MercadoPagoPreference> {
    return this.http.post<MercadoPagoPreference>(this.url + '/mercado-pago/preference', nuevaOrdenDePago);
  }
}
