import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Cliente} from '../models/cliente';
import {Pedido} from '../models/pedido';

@Injectable()
export class PedidosService {

  url = environment.apiUrl + '/api/v1/pedidos';
  urlBusqueda = this.url + '/busqueda/criteria?';

  constructor(private http: HttpClient) {}

  getPedidosCliente(cliente: Cliente, pagina: number) {
    return this.http.post(this.urlBusqueda, {idCliente: cliente.idCliente, pagina: pagina});
  }

  getPedidoPdf(pedido: Pedido): Observable<Blob> {
    return this.http.get(`${this.url}/${pedido.idPedido}/reporte`, {responseType: 'blob'});
  }
}
