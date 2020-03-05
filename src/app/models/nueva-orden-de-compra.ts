import {TipoDeEnvio} from './tipo-de-envio';

export interface NuevaOrdenDeCompra {
  idSucursal: number;
  tipoDeEnvio: TipoDeEnvio;
}
