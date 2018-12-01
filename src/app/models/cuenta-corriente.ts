export interface CuentaCorriente {
  eliminada: boolean;
  fechaApertura: Date;
  fechaUltimoMovimiento: Date;
  idCuentaCorriente: number;
  nombreFiscalCliente: string;
  saldo: number;
  type: string;
}
