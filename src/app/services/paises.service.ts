import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Pais} from '../models/pais';

@Injectable()
export class PaisesService {

  url = environment.apiUrl + '/api/v1/paises';

  constructor(private http: HttpClient) {}

  getPaises(): Observable<[Pais]> {
    return this.http.get<[Pais]>(this.url);
  }
}
