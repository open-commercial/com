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

  getClienteDelUsuario(idUsuario): Observable<Cliente> {
    return this.http.get<Cliente>(this.uriClientes + '/usuarios/' + idUsuario + '/empresas/' + environment.idEmpresa);
  }

  saveCliente(cliente) {
    const arr = ['idCondicionIVA=' + cliente.idCondicionIVA, 'idLocalidad=' + cliente.idLocalidad, 'idEmpresa=' + environment.idEmpresa];

    if (cliente.idCredencial) {
      arr.push('idUsuarioCredencial=' + cliente.idCredencial);
    }

    if (cliente.idViajante) {
      arr.push('idUsuarioViajante=' + cliente.idViajante);
    }

    const url = this.uriClientes + '?' + arr.join('&');

    if (cliente.id_Cliente) {
      return this.http.put(url, cliente);
    } else {
      return this.http.post(url, cliente);
    }
  }
}
