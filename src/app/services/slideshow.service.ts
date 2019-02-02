import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {IImage} from 'ng-simple-slideshow';
import {Router} from '@angular/router';

@Injectable()
export class SlideshowService {

  url = environment.apiUrl;

  constructor(private http: HttpClient,private router: Router) {}

  getSlideshowDataForDesktop(): (string | IImage)[] {
    return [
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1549072680/slideshow/ofertaPalaTramontina-1280x550px.png',
        // href: '/productos;busqueda=pala%20tramontina%20emp%20plast'
        clickAction: () => this.router.navigate(['/productos', { q: 'pala tramontina emp plast'}])
      }
    ];
  }

  getSlideshowDataForMobile(): (string | IImage)[] {
    return [
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1549072679/slideshow/ofertaPalaTramontina-850x450px.png',
        clickAction: () => this.router.navigate(['/productos', { q: 'pala tramontina emp plast'}])
      }
    ];
  }
}
