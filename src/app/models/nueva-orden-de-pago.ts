import {TipoDeEnvio} from './tipo-de-envio';
import {Movimiento} from './movimiento';

export interface NuevaOrdenDePago {
  movimiento: Movimiento;
  idSucursal: number;
  tipoDeEnvio: TipoDeEnvio;
  monto: number;
}
