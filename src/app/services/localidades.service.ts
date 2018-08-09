import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Localidad} from '../models/localidad';

@Injectable()
export class LocalidadesService {

  url = environment.apiUrl + '/api/v1/localidades';

  constructor(private http: HttpClient) {}

  getLocalidades(idProvincia): Observable<Localidad[]> {
    return this.http.get<[Localidad]>(this.url + '/provincias/' + idProvincia);
  }
}
