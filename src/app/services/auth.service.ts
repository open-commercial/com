import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {throwError, Observable, Subject} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {Usuario} from '../models/usuario';
import {UsuariosService} from './usuarios.service';

@Injectable()
export class AuthService {

  url = environment.apiUrl + '/api/v1/login';
  urlUsuario = environment.apiUrl + '/api/v1/usuarios';
  jwtHelper = new JwtHelperService();

  private nombreUsuarioLoggedInSubject = new Subject<string>();
  nombreUsuarioLoggedIn$ = this.nombreUsuarioLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private usuariosService: UsuariosService) {}

  setNombreUsuarioLoggedIn(nombre: string) {
    this.nombreUsuarioLoggedInSubject.next(nombre);
  }

  login(username: string, password: string) {
    const credential = {username: username, password: password};
    return this.http.post(this.url, credential, {responseType: 'text'})
      .pipe(map(data => {
        localStorage.setItem('token', data);
        const decodedToken = this.jwtHelper.decodeToken(data);
        localStorage.setItem('id_Usuario', decodedToken.idUsuario);
      }),
      catchError(err => {
        let msjError;
        if (err.status === 0) {
          msjError = 'Servicio no disponible :(';
        } else {
          msjError = err.error;
        }
        return throwError(msjError);
      }));
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
  }

  getToken(): string {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(localStorage.getItem('token'));
  }

  getLoggedInUsuario(): Observable<Usuario> {
    return this.usuariosService.getUsuario(localStorage.getItem('id_Usuario'));
    // return this.http.get<Usuario>(this.urlUsuario + '/' + localStorage.getItem('id_Usuario'));
  }

  getLoggedInIdUsuario(): string {
    return localStorage.getItem('id_Usuario');
  }
}
