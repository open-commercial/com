import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class RubrosService {

  url = environment.apiUrl + '/api/v1/rubros/empresas/' + environment.idEmpresa;
  idRubroSeleccionado;
  nombreRubroSeleccionado;

  constructor(private http: HttpClient) {}

  getRubros() {
    return this.http.get(this.url);
  }
}
