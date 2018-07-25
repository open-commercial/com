import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Cliente} from '../models/cliente';

@Injectable()
export class PedidosService {

    url = environment.apiUrl + '/api/v1/pedidos';
    urlBusqueda = this.url + '/busqueda/criteria?idEmpresa=' + environment.idEmpresa;

    constructor(private http: HttpClient) {}

    getPedidosCliente(cliente: Cliente, pagina: number = 1, tamanioPagina: number = 5) {
        return this.http.get(
          this.urlBusqueda + '&idCliente=' + cliente.id_Cliente + '&pagina=' + pagina + '&tamanio=' + tamanioPagina);
    }
}
