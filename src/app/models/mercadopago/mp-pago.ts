export enum MPOpcionPago {
  TARJETA_CREDITO = '1',
  TARJETA_DEBITO = '2',
  EFECTIVO = '3',
}

export interface MPPago {
  issuerId: number;
  paymentMethodId: string;
  installments: number;
  token: string;
}
