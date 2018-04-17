import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {JwtHelper, tokenNotExpired} from 'angular2-jwt';
import {Router} from '@angular/router';

@Injectable()
export class AuthService {

  url = environment.apiUrl + '/api/v1/login';
  urlUsuario = environment.apiUrl + '/api/v1/usuarios';
  jwtHelper = new JwtHelper();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    const credential = {username: username, password: password};
    return this.http.post(this.url, credential, {responseType: 'text'})
      .map(data => {
        localStorage.setItem('token', data);
        const decodedToken = this.jwtHelper.decodeToken(data);
        localStorage.setItem('id_Usuario', decodedToken.idUsuario);
      }).catch(err => {
        let msjError;
        if (err.status === 0) {
          msjError = 'Servicio no disponible :(';
        } else {
          msjError = err.error;
        }
        return Observable.throw(msjError);
      });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
  }

  getToken(): string {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return tokenNotExpired();
  }

  getLoggedInUsuario() {
    return this.http.get(this.urlUsuario + '/' + localStorage.getItem('id_Usuario'));
  }

  getLoggedInIdUsuario(): string {
    return localStorage.getItem('id_Usuario');
  }
}
