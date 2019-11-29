import {Component} from '@angular/core';

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

  constructor() {}

}
