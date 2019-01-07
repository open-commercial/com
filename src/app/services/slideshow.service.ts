import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {IImage} from 'ng-simple-slideshow';

@Injectable()
export class SlideshowService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSlideshowDataForDesktop(): (string | IImage)[] {
    return [
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/gladiator-pro.png',
        /* href='/productos;busqueda=gladiator'*/
      },
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1543814304/slideshow/suprabond.jpg',
        /*href='/productos;busqueda=suprabond'*/
      },
    ];
  }

  getSlideshowDataForMobile(): (string | IImage)[] {
    return [
      {
        url: 'http://www.casasparaconstruir.com/projetos/114/01.jpg',
        /* href='/productos;busqueda=gladiator'*/
      },
      {
        url: 'https://images.adsttc.com/media/images/5605/ec3f/e58e/ce79/a500/0305/slideshow/032.jpg',
        /*href='/productos;busqueda=suprabond'*/
      },
    ];
  }
}
