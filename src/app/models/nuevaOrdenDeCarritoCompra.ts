import {TipoDeEnvio} from './tipo-de-envio';

export interface NuevaOrdenDeCarritoCompra {
  idSucursal: string;
  idUsuario: string;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  observaciones: string;
}
