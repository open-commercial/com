import {CategoriaIVA} from './categoria-iva';

export interface Cliente {
  id_Cliente: number;
  nroCliente: string;
  nombreFiscal: string;
  nombreFantasia: string;
  bonificacion: number;
  direccion: string;
  categoriaIVA: CategoriaIVA;
  idFiscal: string;
  email: string;
  telefono: string;
  idLocalidad: number;
  nombreLocalidad: string;
  idProvincia: number;
  nombreProvincia: string;
  idPais: number;
  nombrePais: string;
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
