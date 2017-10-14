import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs/Subject';
import {HttpClient} from '@angular/common/http';
import {AvisoService} from './aviso.service';

@Injectable()
export class ClientesService {

  url = environment.apiUrl + '/api/v1/clientes/busqueda/criteria?idEmpresa=' + environment.idEmpresa;
  private clienteSeleccionadoSubject = new Subject<any>();
  clienteSeleccionado = this.clienteSeleccionadoSubject.asObservable();

  constructor(private http: HttpClient, private avisoService: AvisoService) {}

  getClientes(nombre, pagina, tamanioPagina) {
    const url = this.url + '&razonSocial=' + nombre + '&nombreFantasia=' + nombre
      + '&pagina=' + pagina + '&tamanio=' + tamanioPagina;
    return this.http.get(url);
  }

  addClienteSeleccionado(cliente) {
    localStorage.setItem('clientePedido', JSON.stringify(cliente));
    this.clienteSeleccionadoSubject.next(cliente);
    this.avisoService.openSnackBar('Se seleccionó el cliente: ' + cliente.razonSocial, '', 3500);
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
}
