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
      routeLink: ['/productos', { busqueda: 'gladiator' }],
      nombre: 'Gladiator'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/suprabond.jpg',
      routeLink: ['/productos', { busqueda: 'suprabond' }],
      nombre: 'Suprabond'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/tacsa.jpg',
      routeLink: ['/productos', { busqueda: 'tacsa'}],
      nombre: 'Tacsa'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544154497/slideshow/interelec.jpg',
      routeLink: ['/productos', { busqueda: 'interelec'}],
      nombre: 'Interelec'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/Poxipol.png',
      routeLink: ['/productos', { busqueda: 'poxipol'}],
      nombre: 'Poxipol'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/tramontina.png',
      routeLink: ['/productos', { busqueda: 'tramontina'}],
      nombre: 'Tramontina'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/brogas.jpg',
      routeLink: ['/productos', { busqueda: 'brogas'}],
      nombre: 'Brogas'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/bulit.jpg',
      routeLink: ['/productos', { busqueda: 'bulit'}],
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
