import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';

@Component({
  selector: 'sic-com-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.css']
})
export class SlideshowComponent implements OnInit, AfterViewInit {
  name = 'Angular';
  slideNo = 0;

  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
    load: 3,
    interval: { timing: 4000, initialDelay: 1000 },
    loop: true,
    touch: true,
    velocity: 0.2
  };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
}
