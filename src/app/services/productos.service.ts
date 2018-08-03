import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';



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

  getProductos(pagina: number, tamanioPagina: number) {
    const arr = [
      'descripcion=' + this.getBusquedaCriteria(),
      'pagina=' + pagina,
      'tamanio=' + tamanioPagina,
      'publicos=true'
    ];

    const criteria = '&' + arr.join('&');
    return this.http.get(this.urlBusqueda + criteria);
  }

  getProducto(idProducto: number) {
    return this.http.get(this.url + idProducto);
  }

  getBusquedaCriteria(): string {
    return this.criteria;
  }
}
