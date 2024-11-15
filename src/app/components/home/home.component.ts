import {Component, OnInit} from '@angular/core';
import { IImagen, SlideshowService } from '../../services/slideshow.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { ProductosService } from '../../services/productos.service';

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
      url: 'assets/images/gladiator-pro.png',
      routeLink: ['/productos'],
      queryParams: { q: 'gladiator' },
      nombre: 'Gladiator'
    },
    {
      url: 'assets/images/suprabond.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'suprabond' },
      nombre: 'Suprabond'
    },
    {
      url: 'assets/images/tacsa.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'tacsa'},
      nombre: 'Tacsa'
    },
    {
      url: 'assets/images/interelec.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'interelec'},
      nombre: 'Interelec'
    },
    {
      url: 'assets/images/Poxipol.png',
      routeLink: ['/productos'],
      queryParams: { q: 'pxp'},
      nombre: 'Poxipol'
    },
    {
      url: 'assets/images/tramontina.png',
      routeLink: ['/productos'],
      queryParams: { q: 'tramontina'},
      nombre: 'Tramontina'
    },
    {
      url: 'assets/images/brogas.jpg',
      routeLink: ['/productos'],
      queryParams:  { q: 'brogas'},
      nombre: 'Brogas'
    },
    {
      url: 'assets/images/bulit.jpg',
      routeLink: ['/productos'],
      queryParams: { q: 'bulit'},
      nombre: 'Bulit'
    },
  ];
  imageUrls: IImagen[] = [];

  constructor(private slideshowService: SlideshowService,
              private breakpointObserver: BreakpointObserver,
              private productoService: ProductosService) {}

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

  getLoadMoreObservable() {
    return this.productoService.getProductosEnOferta();
  }
}
