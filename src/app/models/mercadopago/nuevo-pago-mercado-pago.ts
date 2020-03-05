export enum MPOpcionPago {
  TARJETA_CREDITO = '1',
  TARJETA_DEBITO = '2',
  EFECTIVO = '3',
}

export interface NuevoPagoMercadoPago {
  token: string;
  paymentMethodId: string;
  paymentTypeId: string;
  issuerId: number;
  installments: number;
  idSucursal: number;
  monto: number;
}
