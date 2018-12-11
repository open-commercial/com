import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Cliente} from '../models/cliente';
import {CuentaCorriente} from '../models/cuenta-corriente';

@Injectable()
export class CuentasCorrienteService {

  url = environment.apiUrl + '/api/v1/cuentas-corriente';

  constructor(private http: HttpClient) {}

  getCuentaCorriente(cliente: Cliente): Observable<CuentaCorriente> {
    return this.http.get<CuentaCorriente>(this.url + `/clientes/${cliente.id_Cliente}`);
  }

  getCuentaCorrienteRenglones(cuentaCorriente: CuentaCorriente, pagina: number) {
    return this.http.get(
      this.url + `/${cuentaCorriente.idCuentaCorriente}/renglones?pagina=${pagina}`);
  }
}
