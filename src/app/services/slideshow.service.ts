import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {IImage} from 'ng-simple-slideshow';
import {Router} from '@angular/router';

@Injectable()
export class SlideshowService {

  url = environment.apiUrl;

  constructor(private router: Router) {}

  getSlideshowDataForDesktop(): (string | IImage)[] {
    return [
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1549499114/slideshow/oferta-pala-1280x550px.png',
        clickAction: () => this.router.navigate(['/productos', { q: 'pala tramontina emp plast'}])
      }
    ];
  }

  getSlideshowDataForMobile(): (string | IImage)[] {
    return [
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1549499113/slideshow/oferta-pala-850x450px.png',
        clickAction: () => this.router.navigate(['/productos', { q: 'pala tramontina emp plast'}])
      }
    ];
  }
}
