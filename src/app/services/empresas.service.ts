import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';

@Injectable()
export class EmpresasService {
  public url = environment.apiUrl + '/api/v1';

  constructor(private http: HttpClient) { }

  getEmpresas() {
    const urlEmpresa = this.url + '/empresas';
    return this.http.get(urlEmpresa);
  }

  getEmpresa(idEmpresa) {
    const urlEmpresa = this.url + '/empresas/' + idEmpresa;
    return this.http.get(urlEmpresa);
  }
}
