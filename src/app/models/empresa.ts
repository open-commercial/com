import {Ubicacion} from './ubicacion';

export interface Empresa {
  categoriaIVA: string;
  email: string;
  fechaInicioActividad: Date;
  idFiscal: number;
  id_Empresa: number;
  ingresosBrutos: number;
  lema: string;
  logo: string;
  nombre: string;
  telefono: string;
  detalleUbicacion: string;
  idUbicacion: number;
}

/*
* categoriaIVA: "RESPONSABLE_INSCRIPTO"
* detalleUbicacion: "ubicacion empresa 123, Corrientes Corrientes"
* email: ""
* fechaInicioActividad: 922935600000
* idFiscal: 20146623221
* idUbicacion: 2653
* id_Empresa: 5
* ingresosBrutos: 20146623221
* lema: ""
* logo: "https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543743738/Empresa5.png"
* nombre: "Globo de Oro"
* telefono: "0379-4422080"
*/
