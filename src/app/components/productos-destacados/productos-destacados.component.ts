import {Component, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {Producto} from '../../models/producto';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'sic-com-productos-destacados',
  templateUrl: 'productos-destacados.component.html',
  styleUrls: ['./productos-destacados.component.scss']
})
export class ProductosDestacadosComponent implements OnInit {

  destacados: Producto[] = [];

  constructor(private productosService: ProductosService,
              private authService: AuthService) {}

  ngOnInit(): void {
    this.productosService.getProductosDestacados(0)
      .subscribe((data) => this.destacados = data['content']);
  }

  estaBonificado(p) {
    return this.authService.isAuthenticated() && p.precioBonificado !== p.precioLista;
  }
}
