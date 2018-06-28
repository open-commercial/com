import {Component, OnInit, ViewChild} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioComponent } from '../usuario/usuario.component';
import { Usuario } from '../../models/usuario';

@Component({
    selector: 'sic-com-perfil',
    templateUrl: 'perfil.component.html',
})
export class PerfilComponent implements OnInit {
    @ViewChild(UsuarioComponent)
    private usuarioComponent: UsuarioComponent;

    usuario: Usuario = null;
    usuarioReadonly = true;
    constructor(private authService: AuthService) {}
    ngOnInit() {
        this.authService.getLoggedInUsuario().subscribe(
            data => { this.usuario = data; }
        );
    }

    toggleUsuarioEdit() {
        this.usuarioReadonly = !this.usuarioReadonly;
    }

    saveUsuario() {
        this.usuarioComponent.submit();
    }
}
