import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Empresa} from '../models/empresa';

@Injectable()
export class EmpresasService {
  public url = environment.apiUrl + '/api/v1';

  constructor(private http: HttpClient) { }

  getEmpresas(): Observable<Empresa[]> {
    const urlEmpresa = this.url + '/empresas';
    return this.http.get<Empresa[]>(urlEmpresa);
  }

  getEmpresa(idEmpresa): Observable<Empresa> {
    const urlEmpresa = this.url + '/empresas/' + idEmpresa;
    return this.http.get<Empresa>(urlEmpresa);
  }
}
