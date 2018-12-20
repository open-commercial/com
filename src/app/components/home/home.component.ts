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
      nombre: 'Interlec'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/PoxipolLogo1.png',
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

  constructor(private slideshowService: SlideshowService) {}

  ngOnInit(): void {
    this.imageUrls = this.slideshowService.getSlideshowData();
  }
}
