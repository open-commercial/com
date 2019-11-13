import {TipoDeEnvio} from './tipo-de-envio';
import {MPPago} from './mercadopago/mp-pago';

export interface NuevaOrdenDeCarritoCompra {
  idSucursal: number;
  idUsuario: number;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  observaciones: string;
  NuevoPagoMercadoPagoDTO: MPPago;
}

