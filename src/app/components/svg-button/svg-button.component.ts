import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'sic-com-svg-button',
  templateUrl: './svg-button.component.html',
  styleUrls: ['./svg-button.component.scss']
})
export class SvgButtonComponent {
  defaultSvg = [
    '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
    '<path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M12 2l-5.5 9h11z"/><circle fill="currentColor" cx="17.5" cy="17.5" r="4.5"/><path fill="currentColor" d="M3 13.5h8v8H3z"/>',
    '</svg>',
  ].join('');

  private pSvg = '';
  @Input() set svg(value: string) { this.pSvg = value; }
  get svg(): string { return this.pSvg; }

  private pTitle = '';
  @Input() set title(value: string) { this.pTitle = value; }
  get title(): string { return this.pTitle; }

  @Output() buttonClick = new EventEmitter<void>();

  constructor(public helper: HelperService) { }

  click() {
    this.buttonClick.emit();
  }
}
