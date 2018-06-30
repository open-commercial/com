export interface Cliente {
    id_Cliente: number;
    razonSocial: string;
    nombreFantasia: string;
    direccion: string;

    idFiscal: string;
    email: string;
    telPrimario: string;
    telSecundario: string;

    contacto: string;
    fechaAlta: Date;
    eliminado: boolean;
    predeterminado: boolean;
}
