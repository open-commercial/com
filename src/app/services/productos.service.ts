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

  constructor(private http: HttpClient) {}

  buscarProductos(criteria: string) {
    criteria = criteria === null ? '' : criteria;
    this.buscarProductosSubject.next(criteria);
  }

  getProductos(descripcionCriteria: string, idRubro: number, pagina: number, tamanioPagina: number) {
    descripcionCriteria = descripcionCriteria === null ? '' : descripcionCriteria;
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
