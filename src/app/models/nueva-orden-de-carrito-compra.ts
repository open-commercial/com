import {TipoDeEnvio} from './tipo-de-envio';
import {NuevoPagoMercadoPago} from './mercadopago/nuevo-pago-mercado-pago';

export interface NuevaOrdenDeCarritoCompra {
  idSucursal: number;
  idUsuario: number;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  observaciones: string;
  nuevoPagoMercadoPago: NuevoPagoMercadoPago;
}

