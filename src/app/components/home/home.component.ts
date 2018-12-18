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
      href: '/productos;busqueda=gladiator'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/suprabond.jpg',
      href: '/productos;busqueda=suprabond'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/tacsa.jpg',
      href: '/productos;busqueda=tacsa'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544154497/slideshow/interelec.jpg',
      href: '/productos;busqueda=interelec'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/PoxipolLogo1.png',
      href: '/productos;busqueda=poxipol'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/tramontina.png',
      href: '/productos;busqueda=tramontina'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/brogas.jpg',
      href: '/productos;busqueda=brogas'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/bulit.jpg',
      href: '/productos;busqueda=bulit'
    },
  ];

  constructor(private slideshowService: SlideshowService) {}

  ngOnInit(): void {
    this.imageUrls = this.slideshowService.getSlideshowData();
  }
}
