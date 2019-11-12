export enum MPOpcionPago {
  TARJETA_CREDITO = '1',
  TARJETA_DEBITO = '2',
  EFECTIVO = '3',
}

export interface MPPago {
  token: string;
  paymentMethodId: string;
  paymentTypeId: string;
  issuerId: number;
  installments: number;
  idCliente: number;
  idSucursal: number;
  monto: number;
}

/**
 private String token;
 private String paymentMethodId;
 private String paymentTypeId;
 private String issuerId;
 private Integer installments;
 private long idCliente;
 private long idSucursal;
 private Float monto;
 */
