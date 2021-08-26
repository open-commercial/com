import {CantidadEnSucursal} from './cantidad-en-sucursal';

export interface Producto {
  idProducto: number;
  codigo: string;
  descripcion: string;
  cantidadEnSucursales: Array<CantidadEnSucursal>;
  cantidadTotalEnSucursales: number;
  cantidadEnSucursalesDisponible: Array<CantidadEnSucursal>;
  cantidadTotalEnSucursalesDisponible: number;
  cantidadReservada: number;
  cantMinima: number;
  nombreMedida: string;
  precioCosto: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
  precioVentaPublico: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  precioLista: number;
  idRubro: number;
  nombreRubro: string;
  imagenHtmlRubro: string;
  ilimitado: boolean;
  publico: boolean;
  oferta: boolean;
  porcentajeBonificacionOferta: number;
  porcentajeBonificacionPrecio: number;
  precioBonificado: number;
  fechaUltimaModificacion: Date;
  razonSocialProveedor: string;
  nota: string;
  fechaAlta: Date;
  fechaVencimiento: Date;
  eliminado: boolean;
  urlImagen: string;
  favorito: boolean;
}

