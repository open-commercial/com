export interface NuevoReciboDeposito {
  idSucursal: number;
  idPedido: number;
  concepto?: string;
  imagen: number[];
  monto?: number;
}
