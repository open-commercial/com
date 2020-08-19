import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Rubro } from '../../models/rubro';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'sic-com-rubro-button',
  templateUrl: './rubro-button.component.html',
  styleUrls: ['./rubro-button.component.scss']
})
export class RubroButtonComponent implements OnInit {
  private pRubro: Rubro;
  @Input() set rubro(value: Rubro) { this.pRubro = value; }
  get rubro(): Rubro { return this.pRubro; }

  defaultImageHtml = [
    '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
    '<path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M12 2l-5.5 9h11z"/><circle fill="currentColor" cx="17.5" cy="17.5" r="4.5"/><path fill="currentColor" d="M3 13.5h8v8H3z"/>',
    '</svg>',
  ].join('');

  @Output() rubroClick = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  buttonClick() {
    this.rubroClick.emit();
  }

  getImagenHtml(r: Rubro): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(r && r.imagenHtml ? r.imagenHtml : this.defaultImageHtml);
  }
}
