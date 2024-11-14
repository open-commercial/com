import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';

export interface IImagen {
  url: string;
  clickAction?: () => void;
}

@Injectable()
export class SlideshowService {

  url = environment.apiUrl;

  getSlideshowDataForDesktop(): IImagen[] {
    return [
      /*{
        url: 'assets/images/stanley-1280x550.jpg',
        clickAction: () => this.router.navigate(['/productos'], {queryParams: {q: 'termo stanley'}})
      },*/
      {
        url: 'assets/images/redes-1280x550.jpg'
      },
      {
        url: 'assets/images/1280x550-mercadopago.jpg'
      }
    ];
  }

  getSlideshowDataForMobile(): IImagen[] {
    return [
      /*{
        url: 'assets/images/stanley-mobile-800x450.jpg',
        clickAction: () => this.router.navigate(['/productos'], {queryParams: {q: 'termo stanley'}})
      },*/
      {
        url: 'assets/images/redes-800x450.jpg'
      },
      {
        url: 'assets/images/mobile-800x450.jpg'
      }
    ];
  }
}
