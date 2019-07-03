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
  idCliente: number;
  monto: number;
}

/**
 private String token;
 private String paymentMethodId;
 private String issuerId;
 private Integer installments;
 private long idCliente;
 private Float monto;
 */
