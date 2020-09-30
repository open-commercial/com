import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {Producto} from '../models/producto';
import {BusquedaProductoCriteria} from '../models/criterias/BusquedaProductoCriteria';
import { Pagination } from '../models/pagination';

@Injectable()
export class ProductosService {

  url = environment.apiUrl + '/api/v1/productos';
  urlBusqueda = this.url + '/busqueda/criteria?';
  private buscarProductosSubject = new Subject<BusquedaProductoCriteria>();
  buscarProductos$ = this.buscarProductosSubject.asObservable();
  private criteria: BusquedaProductoCriteria = null;

  constructor(private http: HttpClient) {}

  buscarProductos(criteria: BusquedaProductoCriteria) {
    this.criteria = criteria;
    this.buscarProductosSubject.next(this.criteria);
  }

  getBusquedaCriteria(pagina: number): BusquedaProductoCriteria {
    this.criteria.pagina = pagina;
    return this.criteria;
  }

  getProductosSoloPublicos(pagina: number) {
    const criteria = this.getBusquedaCriteria(pagina);
    criteria.publico = true;
    return this.http.post(this.urlBusqueda, criteria);
  }

  getProductosEnOferta(pagina: number) {
    return this.http.post(this.urlBusqueda, {
      oferta: true,
      publico: true,
      pagina: pagina
    });
  }

  getProductoSoloPublico(idProducto: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${idProducto}?publicos=true`);
  }

  getCriteria(): BusquedaProductoCriteria|null {
    return this.criteria;
  }

  getProductosFavoritos(pagina = 0): Observable<Pagination> {
    return this.http.get<Pagination>(`${this.url}/favoritos?pagina=${pagina}`);
  }

  marcarComoFavorito(idProducto: number): Observable<Producto> {
    return this.http.post<Producto>(`${this.url}/${idProducto}/favoritos`, null);
  }

  quitarProductoDeFavorito(idProducto: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idProducto}/favoritos`);
  }

  quitarTodosDeFavoritos(): Observable<void> {
    return this.http.delete<void>(`${this.url}/favoritos`);
  }
}
