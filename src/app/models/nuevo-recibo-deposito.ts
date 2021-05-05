export interface NuevoReciboDeposito {
  idPedido: number;
  idSucursal: number;
  concepto?: string;
  imagen: number[];
  monto?: number;
}
