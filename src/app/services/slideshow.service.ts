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
      /*{
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1558558477/slideshow/caloventor-1280x550-nueva.jpg',
        clickAction: () => this.router.navigate(['/productos', { q: 'caloventor'}])
      },*/
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1558410150/slideshow/redes-1280x550.jpg'
      }
    ];
  }

  getSlideshowDataForMobile(): (string | IImage)[] {
    return [
      /*{
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1558558475/slideshow/caloventor-800x450-nueva.jpg',
        clickAction: () => this.router.navigate(['/productos', { q: 'caloventor'}])
      },*/
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1558410141/slideshow/redes-800x450.jpg'
      }
    ];
  }
}
