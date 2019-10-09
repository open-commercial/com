import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Producto} from '../models/producto';
import {BusquedaProductoCriteria} from '../models/criterias/BusquedaProductoCriteria';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/productos';
  urlBusqueda = this.url + '/busqueda/criteria?';
  private buscarProductosSubject = new Subject<string>();
  buscarProductos$ = this.buscarProductosSubject.asObservable();
  private inputCriteria = '';

  constructor(private http: HttpClient) {}

  buscarProductos(criteria: string) {
    this.inputCriteria = criteria === null ? '' : criteria;
    this.buscarProductosSubject.next(this.inputCriteria);
  }

  getBusquedaCriteria(pagina: number): BusquedaProductoCriteria {
    return {codigo: this.getInputCriteria(), descripcion: this.getInputCriteria(), pagina: pagina};
  }

  getProductosSoloPublicos(pagina: number) {
    const criteria = this.getBusquedaCriteria(pagina);
    criteria.publico = true;
    return this.http.post(this.urlBusqueda, criteria);
  }

  getProductosEnOferta(pagina: number) {
    return this.http.post(this.urlBusqueda, {
      oferta: true,
      pagina: pagina
    });
  }

  getProductoSoloPublico(idProducto: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${idProducto}?publicos=true`);
  }

  getInputCriteria(): string {
    return this.inputCriteria;
  }
}
