import {CategoriaIVA} from './categoria-iva';

export interface RegistracionCuenta {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  categoriaIVA: CategoriaIVA;
  nombreFiscal: string;
  password: string;
  idEmpresa: number;
  recaptcha: string;
}
