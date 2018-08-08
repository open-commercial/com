import {Component} from '@angular/core';

@Component({
  selector: 'sic-com-perfil',
  templateUrl: 'perfil.component.html',
})
export class PerfilComponent {

  private isUsuarioPanelOpened = false;
  private isClientePanelOpened = false;
  private isPedidosPanelOpened = false;

  constructor() {}

}
