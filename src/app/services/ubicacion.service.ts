import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Ubicacion} from '../models/ubicacion';
import {Observable} from 'rxjs';
import {Cliente} from '../models/cliente';

@Injectable()
export class UbicacionService {

  url = environment.apiUrl + '/api/v1/ubicaciones';

  constructor(private http: HttpClient) {}

  createUbicacionFacturacionCliente(c: Cliente, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.url + `/clientes/${c.id_Cliente}/facturacion`, ubicacion);
  }

  createUbicacionEnvioCliente(c: Cliente, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.url + `/clientes/${c.id_Cliente}/envio`, ubicacion);
  }

  updateUbicacion(ubicacion: Ubicacion): Observable<void> {
    return this.http.put<void>(this.url, ubicacion);
  }

}
