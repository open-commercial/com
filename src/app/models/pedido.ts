import {EstadoPedido} from './estado.pedido';

export interface Pedido {
    id_Pedido: number;
    nroPedido: number;
    fecha: Date;
    fechaVencimiento: Date;
    observaciones: string;
    nombreEmpresa: string;
    eliminado: boolean;
    razonSocialCliente: string;
    nombreUsuario: string;
    totalEstimado: number;
    totalActual: number;
    estado: EstadoPedido;
}
