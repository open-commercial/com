import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ClientesService {

  uriClientes = environment.apiUrl + '/api/v1/clientes';
  private clienteSeleccionadoSubject = new Subject<any>();
  clienteSeleccionado = this.clienteSeleccionadoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getClientes(nombre, pagina, tamanioPagina) {
    const uri = this.uriClientes + '/busqueda/criteria?idEmpresa=' + environment.idEmpresa
      + '&razonSocial=' + nombre + '&nombreFantasia=' + nombre
      + '&pagina=' + pagina + '&tamanio=' + tamanioPagina;
    return this.http.get(uri);
  }

  setClienteSeleccionado(cliente) {
    localStorage.setItem('clientePedido', JSON.stringify(cliente));
    this.clienteSeleccionadoSubject.next(cliente);
  }

  getClienteSeleccionado() {
    const cliente = localStorage.getItem('clientePedido');
    if (cliente) {
      return JSON.parse(cliente);
    } else {
      return [];
    }
  }

  deleteClienteSeleccionado() {
    localStorage.setItem('clientePedido', '');
    this.clienteSeleccionadoSubject.next('');
  }

  getClienteDelUsuario(idUsuario) {
    return this.http.get(this.uriClientes + '/usuarios/' + idUsuario + '/empresas/' + environment.idEmpresa);
  }
}
