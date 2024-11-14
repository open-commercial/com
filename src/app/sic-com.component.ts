import {Component} from '@angular/core';
import {Gtag} from 'angular-gtag';
import {environment} from '../environments/environment';

@Component({
  selector: 'sic-com',
  templateUrl: './sic-com.component.html',
  styleUrls: ['./sic-com.component.scss']
})
export class SicComComponent {
  // gtag es para google analitys: se usa la lib https://github.com/codediodeio/angular-gtag
  constructor(gtag: Gtag) {
    this.checkAppVersion();
  }

  checkAppVersion() {
    if (environment.appVersion.toString() !== localStorage.getItem('appVersion')) {
      localStorage.clear();
      localStorage.setItem('appVersion', environment.appVersion.toString());
    }
  }
}
