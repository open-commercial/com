export interface OrdenCompra {
  cantArticulos: number;
  observaciones?: string;
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  total: number;
}
