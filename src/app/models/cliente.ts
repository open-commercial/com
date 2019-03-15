import {CategoriaIVA} from './categoria-iva';

export interface Cliente {
  id_Cliente: number;
  nroCliente: string;
  nombreFiscal: string;
  nombreFantasia: string;
  bonificacion: number;
  categoriaIVA: CategoriaIVA;
  idFiscal: string;
  email: string;
  telefono: string;
  idUbicacionFacturacion: number;
  detalleUbicacionFacturacion: string;
  idUbicacionEnvio: number;
  detalleUbicacionEnvio: string;
  contacto: string;
  fechaAlta: Date;
  idEmpresa: number;
  nombreEmpresa: string;
  idViajante: number;
  nombreViajante: string;
  idCredencial: number;
  nombreCredencial: string;
  predeterminado: boolean;
}
