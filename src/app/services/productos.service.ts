import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Producto} from '../models/producto';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/productos/';
  urlBusqueda = this.url + 'busqueda/criteria?idEmpresa=' + environment.idEmpresa;
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

  getProductos(pagina: number) {
    const criteria = this.getCriteriaBusqueda(pagina);
    return this.http.get(this.urlBusqueda + criteria);
  }

  getProductosDestacados(pagina: number) {
    return this.http.get(this.urlBusqueda + `&destacados=true&pagina=${pagina}`);
  }

  getProducto(idProducto: number): Observable<Producto> {
    return this.http.get<Producto>(this.url + idProducto);
  }

  getBusquedaCriteria(): string {
    return this.criteria;
  }
}
