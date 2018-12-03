import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Producto} from '../models/producto';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/public/productos/';
  urlBusqueda = this.url + 'busqueda/criteria?idEmpresa=' + environment.idEmpresa;
  securedUrl = environment.apiUrl + '/api/v1/productos/';
  securedUrlBusqueda = this.securedUrl + 'busqueda/criteria?idEmpresa=' + environment.idEmpresa;
  private buscarProductosSubject = new Subject<string>();
  buscarProductos$ = this.buscarProductosSubject.asObservable();
  private criteria = '';

  constructor(private http: HttpClient) {}

  buscarProductos(criteria: string) {
    this.criteria = criteria === null ? '' : criteria;
    this.buscarProductosSubject.next(this.criteria);
  }

  getCriteriaBusqueda(pagina: number) {
    const arr = [
      'codigo=' + this.getBusquedaCriteria(),
      'descripcion=' + this.getBusquedaCriteria(),
      'pagina=' + pagina
    ];
    return  '&' + arr.join('&');
  }

  getProductos(pagina: number, urlSegura: boolean = false) {
    const criteria = this.getCriteriaBusqueda(pagina);
    const url = urlSegura ? this.securedUrlBusqueda : this.urlBusqueda;
    return this.http.get(url + criteria);
  }

  getProducto(idProducto: number, urlSegura: boolean = false): Observable<Producto> {
    const url = urlSegura ? this.securedUrl : this.url;
    return this.http.get<Producto>(url + idProducto);
  }

  getBusquedaCriteria(): string {
    return this.criteria;
  }
}
