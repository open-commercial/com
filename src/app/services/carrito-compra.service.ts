import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {CarritoCompra} from '../models/carrito-compra';
import {ItemCarritoCompra} from '../models/item-carrito-compra';
import {NuevaOrdenDePago} from '../models/nueva-orden-de-pago';
import {ProductoFaltante} from '../models/producto-faltante';

@Injectable()
export class CarritoCompraService {

  uri = environment.apiUrl + '/api/v1/carrito-compra';
  private cantidadItemsEnCarritoSubject = new Subject<number>();
  cantidadItemsEnCarrito$ = this.cantidadItemsEnCarritoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCarritoCompra(idCliente: number): Observable<CarritoCompra> {
    return this.http.get<CarritoCompra>(`${this.uri}/clientes/${idCliente}`);
  }

  setCantidadItemsEnCarrito(cantidad: number) {
    this.cantidadItemsEnCarritoSubject.next(cantidad);
  }

  actualizarAlPedido(producto, cantidad) {
    const uriPost = `${this.uri}/productos/${producto['idProducto']}?cantidad=${cantidad}`;
    return this.http.post(uriPost, {});
  }

  getItems(pagina: number) {
    const uriGet = `${this.uri}/items?pagina=${pagina}`;
    return this.http.get(uriGet);
  }

  eliminarTodosLosItems() {
    const urlDelete = `${this.uri}`;
    return this.http.delete(urlDelete);
  }

  eliminarItem(id: number) {
    const uriDelete = `${this.uri}/productos/${id}`;
    return this.http.delete(uriDelete);
  }

  enviarOrden(nuevaOrdenDePago: NuevaOrdenDePago) {
    return this.http.post(this.uri, nuevaOrdenDePago);
  }

  getCantidadEnCarrito(idProducto): Observable<ItemCarritoCompra> {
    return this.http.get<ItemCarritoCompra>(`${this.uri}/productos/${idProducto}`);
  }

  getDisponibilidadStock(): Observable<ProductoFaltante[]> {
    return this.http.get<ProductoFaltante[]>(`${this.uri}/disponibilidad-stock`);
  }
}
