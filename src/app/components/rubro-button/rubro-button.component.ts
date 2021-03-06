import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Rubro } from '../../models/rubro';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'sic-com-rubro-button',
  templateUrl: './rubro-button.component.html',
  styleUrls: ['./rubro-button.component.scss']
})
export class RubroButtonComponent {
  private pRubro: Rubro;
  @Input() set rubro(value: Rubro) { this.pRubro = value; }
  get rubro(): Rubro { return this.pRubro; }

  @Output() rubroClick = new EventEmitter<void>();

  constructor(public helper: HelperService) { }

  buttonClick() {
    this.rubroClick.emit();
  }
}
