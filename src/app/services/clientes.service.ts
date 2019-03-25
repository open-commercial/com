import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Subject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Cliente} from '../models/cliente';

@Injectable()
export class ClientesService {

  uriClientes = environment.apiUrl + '/api/v1/clientes';
  private clienteSeleccionadoSubject = new Subject<any>();
  clienteSeleccionado$ = this.clienteSeleccionadoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getClientes(nombre, pagina) {
    const uri = this.uriClientes + '/busqueda/criteria?idEmpresa=' + environment.idEmpresa
      + '&nombreFiscal=' + nombre + '&nombreFantasia=' + nombre + '&nroCliente=' + nombre
      + '&pagina=' + pagina;
    return this.http.get(uri);
  }

  setClienteSeleccionado(cliente) {
    localStorage.setItem('clientePedido', JSON.stringify(cliente));
    this.clienteSeleccionadoSubject.next(cliente);
  }

  getClienteSeleccionado(): Cliente {
    const cliente = localStorage.getItem('clientePedido');
    if (cliente) {
      return JSON.parse(cliente);
    } else {
      return null;
    }
  }

  deleteClienteSeleccionado() {
    localStorage.setItem('clientePedido', '');
    this.clienteSeleccionadoSubject.next('');
  }

  getClienteDelUsuario(idUsuario): Observable<Cliente> {
    return this.http.get<Cliente>(this.uriClientes + '/usuarios/' + idUsuario + '/empresas/' + environment.idEmpresa);
  }

  getCliente(idCliente): Observable<Cliente> {
    return this.http.get<Cliente>(this.uriClientes + '/' + idCliente);
  }

  saveCliente(cliente) {
    const arr = ['idEmpresa=' + environment.idEmpresa];
    if (cliente.idLocalidad) {
      arr.push('idLocalidad=' + cliente.idLocalidad);
    }
    if (cliente.idViajante) {
      arr.push('idViajante=' + cliente.idViajante);
    }
    const url = this.uriClientes + '?' + arr.join('&');

    return this.http.put(url, cliente);
  }
}
