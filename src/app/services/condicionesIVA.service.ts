import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CondicionIVA} from '../models/condicionIVA';

@Injectable()
export class CondicionesIVAService {

  url = environment.apiUrl + '/api/v1/condiciones-iva';

  constructor(private http: HttpClient) {}

  getCondicionesIVA(): Observable<[CondicionIVA]> {
    return this.http.get<[CondicionIVA]>(this.url);
  }
}
