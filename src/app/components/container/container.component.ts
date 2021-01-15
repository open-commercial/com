import {Component} from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sic-com-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {
  envQA = environment.qa;
  constructor() {}
}
