import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Ubicacion} from '../models/ubicacion';
import {Observable} from 'rxjs';
import {Cliente} from '../models/cliente';
import get = Reflect.get;
import {Provincia} from '../models/provincia';
import {Localidad} from '../models/localidad';

@Injectable()
export class UbicacionService {

  url = environment.apiUrl + '/api/v1/ubicaciones';

  constructor(private http: HttpClient) {}

  getUbicacion(idUbicacion: number): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(this.url + `/${idUbicacion}`);
  }

  createUbicacionFacturacionCliente(c: Cliente, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.url + `/clientes/${c.id_Cliente}/facturacion`, ubicacion);
  }

  createUbicacionEnvioCliente(c: Cliente, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.url + `/clientes/${c.id_Cliente}/envio`, ubicacion);
  }

  updateUbicacion(ubicacion: Ubicacion): Observable<void> {
    return this.http.put<void>(this.url, ubicacion);
  }

  getProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.url}/provincias`);
  }

  getLocalidades(idProvincia): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.url}/localidades/provincias/${idProvincia}`);
  }
}
