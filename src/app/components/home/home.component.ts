import {Component, OnInit} from '@angular/core';
import {IImage} from 'ng-simple-slideshow';
import {SlideshowService} from '../../services/slideshow.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'sic-com-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  height = '50vw';
  imageUrls: (string | IImage)[] = [];
  marcas = [
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/gladiator-pro.png',
      routeLink: ['/productos', { q: 'gladiator' }],
      nombre: 'Gladiator'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/suprabond.jpg',
      routeLink: ['/productos', { q: 'suprabond' }],
      nombre: 'Suprabond'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/tacsa.jpg',
      routeLink: ['/productos', { q: 'tacsa'}],
      nombre: 'Tacsa'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544154497/slideshow/interelec.jpg',
      routeLink: ['/productos', { q: 'interelec'}],
      nombre: 'Interelec'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/Poxipol.png',
      routeLink: ['/productos', { q: 'poxipol'}],
      nombre: 'Poxipol'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/tramontina.png',
      routeLink: ['/productos', { q: 'tramontina'}],
      nombre: 'Tramontina'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/brogas.jpg',
      routeLink: ['/productos', { q: 'brogas'}],
      nombre: 'Brogas'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/bulit.jpg',
      routeLink: ['/productos', { q: 'bulit'}],
      nombre: 'Bulit'
    },
  ];

  constructor(private slideshowService: SlideshowService,
              private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall, Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.height = '50vw';
        this.imageUrls = this.slideshowService.getSlideshowDataForMobile();
      } else {
        this.height = '30vw';
        this.imageUrls = this.slideshowService.getSlideshowDataForDesktop();
      }
    });
  }
}
