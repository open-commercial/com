import {Rol} from './rol';

export interface Usuario {
    id_Usuario: number;
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    idSucursalPredeterminada: number;
    roles: Array<Rol>;
    habilitado: boolean;
}
