import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {OrdenCompra} from '../models/orden-compra';

@Injectable()
export class CarritoCompraService {

  url = environment.apiUrl + '/api/v1';
  urlCarrito = this.url + '/carrito-compra/usuarios/';
  private cantidadItemsEnCarritoSubject = new Subject<number>();
  cantidadItemsEnCarrito$ = this.cantidadItemsEnCarritoSubject.asObservable();

  constructor(private http: HttpClient) {}

  setCantidadItemsEnCarrito(cantidad: number) {
    this.cantidadItemsEnCarritoSubject.next(cantidad);
  }

  agregarQuitarAlPedido(producto, cantidad) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const urlAddCarrito = this.urlCarrito + idUsuario + '/productos/' + producto['idProducto'] + '?cantidad=' + cantidad;
    return this.http.post(urlAddCarrito, {});
  }

  actualizarAlPedido(producto, cantidad) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const urlActCarrito = this.urlCarrito + idUsuario + '/productos/' + producto['idProducto'] + '?cantidad=' + cantidad;
    return this.http.put(urlActCarrito, {});
  }

  getItems(pagina: number, tamanioPagina: number) {
    const idUsuario = localStorage.getItem('id_Usuario');
    const urlAllItems = this.urlCarrito + idUsuario + '/?pagina=' + pagina + '&tamanio=' + tamanioPagina;
    return this.http.get(urlAllItems);
  }

  eliminarTodosLosItems() {
    const urlDeleteAllItems = this.urlCarrito + localStorage.getItem('id_Usuario');
    return this.http.delete(urlDeleteAllItems);
  }

  eliminarItem(id: number) {
    const urlDeleteItem = this.urlCarrito + localStorage.getItem('id_Usuario') + '/productos/' + id;
    return this.http.delete(urlDeleteItem);
  }

  enviarOrden(orden: OrdenCompra, idEmpresa, idUsuario, idCliente) {
    const uri = this.url + `/carrito-compra?idEmpresa=${idEmpresa}&idUsuario=${idUsuario}&idCliente=${idCliente}`;
    return this.http.post(uri, orden);
  }

  getTotalImportePedido() {
    const urlTotalImpPedido = this.urlCarrito + localStorage.getItem('id_Usuario') + '/total';
    return this.http.get(urlTotalImpPedido);
  }

  getCantidadRenglones() {
    const urlCantRenglones = this.urlCarrito + localStorage.getItem('id_Usuario') + '/cantidad-renglones';
    return this.http.get(urlCantRenglones);
  }

  getCantidadArticulos() {
    const urlCantArticulos = this.urlCarrito + localStorage.getItem('id_Usuario') + '/cantidad-articulos';
    return this.http.get(urlCantArticulos);
  }

}
