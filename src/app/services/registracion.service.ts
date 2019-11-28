import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class RegistracionService {

  url = environment.apiUrl + '/api/v1/registracion';

  constructor(private http: HttpClient) {}

  registrar(reg) {
    reg.idSucursal = environment.idSucursal;
    return this.http.post(this.url, reg);
  }
}
