import {Producto} from './producto';

export interface ItemCarritoCompra {
  idItemCarritoCompra: number;
  cantidad: number;
  producto: Producto;
  importe: number;
}
