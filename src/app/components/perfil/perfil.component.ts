import {Component, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';

@Component({
    selector: 'sic-com-perfil',
    templateUrl: 'perfil.component.html',
})
export class PerfilComponent implements OnInit {
    usuario: Usuario = null;
    cliente: Cliente = null;

    constructor(private authService: AuthService, private clientesService: ClientesService) {}

    ngOnInit() {
        this.authService.getLoggedInUsuario().subscribe(
            (data: Usuario) => {
                this.usuario = data;
                this.clientesService.getClienteDelUsuario(this.usuario.id_Usuario).subscribe(
                    (data1: Cliente) =>  this.cliente = data1
                );
            }
        );
    }
}
