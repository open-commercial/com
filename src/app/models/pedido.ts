import {EstadoPedido} from './estado.pedido';

export interface Pedido {
  idPedido: number;
  nroPedido: number;
  fecha: Date;
  fechaVencimiento: Date;
  observaciones: string;
  nombreEmpresa: string;
  eliminado: boolean;
  nombreFiscalCliente: string;
  nombreUsuario: string;
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  totalEstimado: number;
  totalActual: number;
  estado: EstadoPedido;
}
