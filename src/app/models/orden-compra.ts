export interface OrdenCompra {
  observaciones?: string;
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  total: number;
}
