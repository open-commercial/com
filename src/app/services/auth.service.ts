import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';
import { UsuariosService } from './usuarios.service';
import { StorageService } from './storage.service';
import { PasswordRecovery } from '../models/password-recovery'

@Injectable()
export class AuthService {

  urlLogin = environment.apiUrl + '/api/v1/login';
  urlLogout = environment.apiUrl + '/api/v1/logout';
  urlPasswordRecovery = environment.apiUrl + '/api/v1/password-recovery';
  jwtHelper = new JwtHelperService();
  private nombreUsuarioLoggedInSubject = new Subject<string>();
  nombreUsuarioLoggedIn$ = this.nombreUsuarioLoggedInSubject.asObservable();

  constructor(private http: HttpClient,
    private router: Router,
    private usuariosService: UsuariosService,
    private storageService: StorageService) {
  }

  setNombreUsuarioLoggedIn(nombre: string) {
    this.nombreUsuarioLoggedInSubject.next(nombre);
  }

  login(user: string, pass: string) {
    const credential = { username: user, password: pass };
    return this.http.post(this.urlLogin, credential, { responseType: 'text' })
      .pipe(
        map(data => {
          this.setAuthenticationInfo(data);
        }),
        catchError(err => {
          let msjError;
          if (err.status === 0) {
            msjError = 'Servicio no disponible :(';
          } else {
            msjError = err.error;
          }
          return throwError(msjError);
        })
      );
  }

  logout() {
    this.http.put(this.urlLogout, null)
      .subscribe(() => {
        this.cleanAccessTokenInLocalStorage();
        this.router.navigate(['/login'], { queryParams: { return: this.router.routerState.snapshot.url } });
      });
  }

  cleanAccessTokenInLocalStorage() {
    this.storageService.removeItem('token');
  }

  getToken(): string {
    return this.storageService.getItem('token');
  }

  isAuthenticated(): boolean {
    const isExpired = this.jwtHelper.isTokenExpired(this.storageService.getItem('token'));
    if (isExpired) { this.cleanAccessTokenInLocalStorage(); }
    return !isExpired;
  }

  getLoggedInUsuario(): Observable<Usuario> {
    return this.usuariosService.getUsuario(this.getLoggedInIdUsuario());
  }

  getLoggedInIdUsuario(): string {
    const token = this.storageService.getItem('token');
    if (!token) { return null; }

    const decodedToken = this.jwtHelper.decodeToken(token);
    return decodedToken.idUsuario;
  }

  solicitarCambioContrasenia(email: string) {
    return this.http.get(this.urlPasswordRecovery + '?idSucursal=' + `&email=${email}`);
  }

  cambiarPassword(passwordRecoveryData: PasswordRecovery) {
    return this.http.post(this.urlPasswordRecovery, passwordRecoveryData, { responseType: 'text' });
  }

  setAuthenticationInfo(token: string) {
    this.storageService.setItem('token', token);
  }
}
