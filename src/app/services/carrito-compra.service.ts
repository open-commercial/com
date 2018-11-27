import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {CarritoCompra} from '../models/carrito-compra';

@Injectable()
export class CarritoCompraService {

  uri = environment.apiUrl + '/api/v1/carrito-compra';
  private cantidadItemsEnCarritoSubject = new Subject<number>();
  cantidadItemsEnCarrito$ = this.cantidadItemsEnCarritoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCarritoCompra(idCliente: number): Observable<CarritoCompra> {
    const idUsuario = localStorage.getItem('id_Usuario');
    return this.http.get<CarritoCompra>(`${this.uri}/usuarios/${idUsuario}/clientes/${idCliente}`);
  }

  setCantidadItemsEnCarrito(cantidad: number) {
    this.cantidadItemsEnCarritoSubject.next(cantidad);
  }

  agregarQuitarAlPedido(producto, cantidad) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriPost = `${this.uri}/usuarios/${idUsuario}/productos/${producto['idProducto']}?cantidad=${cantidad}`;
    return this.http.post(uriPost, {});
  }

  actualizarAlPedido(producto, cantidad) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriPut = `${this.uri}/usuarios/${idUsuario}/productos/${producto['idProducto']}?cantidad=${cantidad}`;
    return this.http.put(uriPut, {});
  }

  getItems(pagina: number) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriGet = `${this.uri}/usuarios/${idUsuario}?pagina=${pagina}`;
    return this.http.get(uriGet);
  }

  eliminarTodosLosItems() {
    const idUsuario = localStorage.getItem('id_Usuario');
    const urlDelete = `${this.uri}/usuarios/${idUsuario}`;
    return this.http.delete(urlDelete);
  }

  eliminarItem(id: number) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const uriDelete = `${this.uri}/usuarios/${idUsuario}/productos/${id}`;
    return this.http.delete(uriDelete);
  }

  enviarOrden(observaciones: string, idUsuario, idCliente) {
    const uriPost = `${this.uri}?idEmpresa=${environment.idEmpresa}&idUsuario=${idUsuario}&idCliente=${idCliente}`;
    return this.http.post(uriPost, observaciones);
  }




  /*
  getTotalImportePedido(idCliente): Observable<Number> {
    const urlTotalImpPedido = this.urlCarrito + localStorage.getItem('id_Usuario') + '/clientes/' + idCliente + '/total';
    return this.http.get<Number>(urlTotalImpPedido);
  }

  getCantidadRenglones() {
    const urlCantRenglones = this.urlCarrito + localStorage.getItem('id_Usuario') + '/cantidad-renglones';
    return this.http.get(urlCantRenglones);
  }

  getCantidadArticulos(): Observable<Number> {
    const urlCantArticulos = this.urlCarrito + localStorage.getItem('id_Usuario') + '/cantidad-articulos';
    return this.http.get<Number>(urlCantArticulos);
  }

  getSubtotalImportePedido(): Observable<Number> {
    const urlSubtotal = this.urlCarrito + localStorage.getItem('id_Usuario') + '/subtotal';
    return this.http.get<Number>(urlSubtotal);
  }
  */
}
