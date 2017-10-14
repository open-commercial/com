import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/productos/';
  urlBusqueda = this.url + 'busqueda/criteria?idEmpresa=' + environment.idEmpresa;
  private buscarProductosSubject = new Subject<string>();
  buscarProductos$ = this.buscarProductosSubject.asObservable();

  constructor(private http: HttpClient) {}

  buscarProductos(criteria: string) {
    this.buscarProductosSubject.next(criteria);
  }

  getProductos(descripcionCriteria: string, idRubro: number, pagina: number, tamanioPagina: number) {
    let criteria = '&descripcion=' + descripcionCriteria + '&pagina=' + pagina + '&tamanio=' + tamanioPagina;
    if (idRubro) {
      criteria += '&idRubro=' + idRubro;
    }
    return this.http.get(this.urlBusqueda + criteria);
  }

  getProducto(idProducto: number) {
    return this.http.get(this.url + idProducto);
  }
}
