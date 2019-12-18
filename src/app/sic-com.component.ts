import {Component} from '@angular/core';
import {Gtag} from 'angular-gtag';
import {StorageService} from './services/storage.service';
import {environment} from '../environments/environment';

@Component({
  selector: 'sic-com',
  templateUrl: './sic-com.component.html',
  styleUrls: ['./sic-com.component.scss']
})
export class SicComComponent {
  // gtag es para google analitys: se usa la lib https://github.com/codediodeio/angular-gtag
  constructor(gtag: Gtag,
              private storageService: StorageService) {
    this.checkAppVersion();
  }

  checkAppVersion() {
    if (environment.version !== this.storageService.getItem('app-version')) {
      this.storageService.clear();
    }
  }
}
