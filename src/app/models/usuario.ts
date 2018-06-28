import {Rol} from './rol';

export interface Usuario {
    id_Usuario: number;
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    token: string;
    passwordRecoverykey: string;
    habilitado: boolean;
    eliminado: boolean;
    roles: Array<Rol>;
}
