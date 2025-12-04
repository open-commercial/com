import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'sic-com-perfil',
  templateUrl: 'perfil.component.html',
  styleUrls: ['perfil.component.scss']
})
export class PerfilComponent {

  isUsuarioPanelOpened = false;
  isClientePanelOpened = false;
  isUbicacionesPanelOpened = false;
  isPedidosPanelOpened = false;
  isCuentaCorrientePanelOpened = false;

  constructor(private readonly authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
