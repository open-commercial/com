import {Component} from '@angular/core';
import {Gtag} from 'angular-gtag';

@Component({
  selector: 'sic-com',
  templateUrl: './sic-com.component.html',
  styleUrls: ['./sic-com.component.scss']
})
export class SicComComponent {
  // gtag es para google analitys: se usa la lib https://github.com/codediodeio/angular-gtag
  constructor(gtag: Gtag) {}
}
