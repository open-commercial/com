import {Rol} from './rol';

export interface Usuario {
    idUsuario: number;
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    idEmpresaPredeterminada: number;
    roles: Array<Rol>;
    habilitado: boolean;
}
