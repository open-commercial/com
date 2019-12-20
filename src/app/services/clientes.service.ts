import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Subject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Cliente} from '../models/cliente';
import {StorageService} from './storage.service';

@Injectable()
export class ClientesService {

  uriClientes = environment.apiUrl + '/api/v1/clientes';
  private clienteSeleccionadoSubject = new Subject<any>();
  clienteSeleccionado$ = this.clienteSeleccionadoSubject.asObservable();

  constructor(private http: HttpClient,
              private storageService: StorageService) {}

  getClientes(nombre, pagina) {
    return this.http.post(this.uriClientes + '/busqueda/criteria?',
      {nombreFiscal: nombre, nombreFantasia: nombre, nroCliente: nombre, pagina: pagina});
  }

  setClienteSeleccionado(cliente) {
    this.storageService.setItem('clientePedido', cliente);
    this.clienteSeleccionadoSubject.next(cliente);
  }

  getClienteSeleccionado(): Cliente {
    return this.storageService.getItem('clientePedido');
  }

  deleteClienteSeleccionado() {
    this.storageService.removeItem('clientePedido');
    this.clienteSeleccionadoSubject.next('');
  }

  getClienteDelUsuario(idUsuario): Observable<Cliente> {
    return this.http.get<Cliente>(this.uriClientes + '/usuarios/' + idUsuario);
  }

  getCliente(idCliente): Observable<Cliente> {
    return this.http.get<Cliente>(this.uriClientes + '/' + idCliente);
  }

  saveCliente(cliente) {
    return this.http.put(this.uriClientes, cliente);
  }
}
