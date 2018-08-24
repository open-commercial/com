export interface CuentaCorriente {
  eliminada: boolean;
  fechaApertura: Date;
  fechaUltimoMovimiento: Date;
  idCuentaCorriente: number
  razonSocialCliente: string;
  saldo: number;
  type: string;
}
