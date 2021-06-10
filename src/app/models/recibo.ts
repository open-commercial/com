import { EstadoRecibo } from './estado-recibo';

export interface Recibo {
  idRecibo: number;
  numSerie: number;
  numRecibo: number;
  fecha: Date;
  eliminado: boolean;
  concepto: string;
  idFormaDePago: number;
  nombreFormaDePago: string;
  idSucursal: number;
  nombreSucursal: string;
  idCliente: number;
  nombreFiscalCliente: string;
  idProveedor: number;
  razonSocialProveedor: string;
  nombreUsuario: string;
  idViajante: number;
  nombreViajante: string;
  monto: number;
  urlImagen: string;
  estado: EstadoRecibo;
}
