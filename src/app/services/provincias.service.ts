import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Provincia} from '../models/provincia';

@Injectable()
export class ProvinciasService {

  url = environment.apiUrl + '/api/v1/provincias';

  constructor(private http: HttpClient) {}

  getProvincias(idPais): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(this.url + '/paises/' + idPais);
  }
}
