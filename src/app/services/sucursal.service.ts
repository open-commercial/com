import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Sucursal} from '../models/sucursal';

@Injectable()
export class SucursalService {

  public url = environment.apiUrl + '/api/v1';

  constructor(private http: HttpClient) { }

  getSucursalesConPuntoDeRetiro(): Observable<Sucursal[]> {
    const urlSucursal = this.url + '/sucursales?puntoDeRetiro=true';
    return this.http.get<Sucursal[]>(urlSucursal);
  }

  getSucursal(idSucursal): Observable<Sucursal> {
    const urlSucursal = this.url + '/sucursales/' + idSucursal;
    return this.http.get<Sucursal>(urlSucursal);
  }
}
