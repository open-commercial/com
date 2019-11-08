import {TipoDeEnvio} from './tipo-de-envio';

export interface NuevaOrdenDeCarritoCompra {
  idSucursal: number;
  idUsuario: number;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  observaciones: string;
}
