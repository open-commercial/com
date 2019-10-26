export interface Producto {
  idProducto: number;
  hayStock: boolean;
  cantidad: number;
  codigo: string;
  descripcion: string;
  nombreMedida: string;
  nombreRubro: string;
  bulto: number;
  precioLista: number;
  oferta: boolean;
  porcentajeBonificacionOferta: number;
  precioListaBonificado: number;
  ventaMinima: number;
  urlImagen: string;
}

