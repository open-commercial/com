import {Component, OnInit} from '@angular/core';
import { IImagen, SlideshowService } from '../../services/slideshow.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'sic-com-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isMobile = true;
  height = '50vw';
  marcas = [
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/gladiator-pro.png',
      routeLink: ['/productos'],
      queryParams: { q: 'gladiator' },
      nombre: 'Gladiator'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/suprabond.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'suprabond' },
      nombre: 'Suprabond'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/tacsa.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'tacsa'},
      nombre: 'Tacsa'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544154497/slideshow/interelec.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'interelec'},
      nombre: 'Interelec'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/Poxipol.png',
      routeLink: ['/productos'],
      queryParams: { q: 'pxp'},
      nombre: 'Poxipol'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/tramontina.png',
      routeLink: ['/productos'],
      queryParams: { q: 'tramontina'},
      nombre: 'Tramontina'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/brogas.jpg',
      routeLink: ['/productos'],
      queryParams:  { q: 'brogas'},
      nombre: 'Brogas'
    },
    {
      url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1544153960/slideshow/bulit.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'bulit'},
      nombre: 'Bulit'
    },
  ];
  imageUrls: IImagen[] = [];

  constructor(private slideshowService: SlideshowService,
              private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall, Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.height = '50vw';
        this.imageUrls = this.slideshowService.getSlideshowDataForMobile();
        this.isMobile = true;
      } else {
        this.height = '30vw';
        this.imageUrls = this.slideshowService.getSlideshowDataForDesktop();
        this.isMobile = false;
      }
    });
  }
}
