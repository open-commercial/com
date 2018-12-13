import {Component, OnInit} from '@angular/core';
import {IImage} from 'ng-simple-slideshow';
import {SlideshowService} from '../../services/slideshow.service';

@Component({
  selector: 'sic-com-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  imageUrls: (string | IImage)[] = [];

  constructor(private slideshowService: SlideshowService) {}

  ngOnInit(): void {
    this.imageUrls = this.slideshowService.getSlideshowData();
  }
}
