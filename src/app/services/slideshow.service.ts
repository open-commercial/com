import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';

@Injectable()
export class SlideshowService {

  url = environment.apiUrl;

  constructor() {}

  // getSlideshowDataForDesktop(): (string | IImage)[] {
  //   return [
  //     // {
  //     //   url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1601508662/slideshow/stanley-1280x550.jpg',
  //     //   clickAction: () => this.router.navigate(['/productos'], {queryParams: {q: 'termo stanley'}})
  //     // },
  //     {
  //       url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1558410150/slideshow/redes-1280x550.jpg'
  //     },
  //     {
  //       url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1584392155/slideshow/1280x550-mercadopago.jpg'
  //     }
  //   ];
  // }
  //
  // getSlideshowDataForMobile(): (string | IImage)[] {
  //   return [
  //     // {
  //     //   url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1601508662/slideshow/stanley-mobile-800x450.jpg',
  //     //   clickAction: () => this.router.navigate(['/productos'], {queryParams: {q: 'termo stanley'}})
  //     // },
  //     {
  //       url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1558410141/slideshow/redes-800x450.jpg'
  //     },
  //     {
  //       url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1584468529/slideshow/mobile-800x450.jpg'
  //     }
  //   ];
  // }
}
