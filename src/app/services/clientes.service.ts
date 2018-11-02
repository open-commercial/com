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
      + '&razonSocial=' + nombre + '&nombreFantasia=' + nombre + '&nroCliente=' + nombre
      + '&pagina=' + pagina + '&tamanio=' + tamanioPagina;
    return this.http.get(uri);
  }

  getAllClientes(nombre) {
    const uri = this.uriClientes + '/busqueda/criteria?idEmpresa=' + environment.idEmpresa
      + '&razonSocial=' + nombre + '&nombreFantasia=' + nombre + '&nroCliente=' + nombre;
    return this.http.get<any>(uri);
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

  saveCliente(cliente) {
    const arr = ['idEmpresa=' + environment.idEmpresa];
    if (cliente.idLocalidad) {
      arr.push('idLocalidad=' + cliente.idLocalidad);
    }
    if (cliente.idCredencial) {
      arr.push('idCredencial=' + cliente.idCredencial);
    }
    if (cliente.idViajante) {
      arr.push('idViajante=' + cliente.idViajante);
    }
    const url = this.uriClientes + '?' + arr.join('&');
    if (cliente.id_Cliente) {
      return this.http.put(url, cliente);
    } else {
      return this.http.post(url, cliente);
    }
  }
}
