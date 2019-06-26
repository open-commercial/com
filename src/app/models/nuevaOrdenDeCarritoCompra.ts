import {TipoDeEnvio} from './tipo-de-envio';
import {MPPago} from './mercadopago/mp-pago';

export interface NuevaOrdenDeCarritoCompra {
  idEmpresa: string;
  idUsuario: string;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  idSucursal: number;
  observaciones: string;
  pago: MPPago;
}
