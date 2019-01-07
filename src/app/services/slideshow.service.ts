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
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1546837035/slideshow/ofertaConservadora1280x600.jpg',
      },
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1546840178/slideshow/ofertaDesmalezadora1280x600.jpg',
      },
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1546842909/slideshow/ofertaPala1280x600.jpg',
      }
    ];
  }

  getSlideshowDataForMobile(): (string | IImage)[] {
    return [
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1546833123/slideshow/ofertaConservadora800x450.jpg',
      },
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1546841267/slideshow/ofertaDesmalezadora800x450.jpg',
      },
      {
        url: 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1546843709/slideshow/ofertaPala800x450.jpg',
      }
    ];
  }
}
