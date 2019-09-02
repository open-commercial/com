import {Ubicacion} from './ubicacion';

export interface Sucursal {
  categoriaIVA: string;
  email: string;
  fechaInicioActividad: Date;
  idFiscal: number;
  idSucursal: number;
  ingresosBrutos: number;
  lema: string;
  logo: string;
  nombre: string;
  telefono: string;
  detalleUbicacion: string;
  ubicacion: Ubicacion;
}

