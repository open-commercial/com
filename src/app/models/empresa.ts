import {Ubicacion} from './ubicacion';

export interface Empresa {
  categoriaIVA: string;
  eliminada: boolean;
  email: string;
  fechaInicioActividad: Date;
  idFiscal: number;
  id_Empresa: number;
  ingresosBrutos: number;
  lema: string;
  logo: string;
  nombre: string;
  telefono: string;
  ubicacion: Ubicacion;
}
