import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sic-com-qa-banner',
  templateUrl: './qa-banner.component.html',
  styleUrls: ['./qa-banner.component.scss']
})
export class QaBannerComponent implements OnInit {
  envQA = environment.qa;
  constructor() { }

  ngOnInit() {
  }
}
