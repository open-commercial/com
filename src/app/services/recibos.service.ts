import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NuevoReciboDeposito } from '../models/nuevo-recibo-deposito';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecibosService {
  url = environment.apiUrl + '/api/v1/recibos';

  constructor(private http: HttpClient) { }

  generarReciboDeposito(nrd: NuevoReciboDeposito): Observable<void> {
    if (!nrd.idSucursal) { nrd.idSucursal = environment.idSucursal; }
    return this.http.post<void>(`${this.url}/clientes/depositos`, nrd);
  }
}
