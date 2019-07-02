import {TipoDeEnvio} from './tipo-de-envio';

export interface NuevaOrdenDeCarritoCompra {
  idEmpresa: string;
  idUsuario: string;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  idSucursal: number;
  observaciones: string;
}
