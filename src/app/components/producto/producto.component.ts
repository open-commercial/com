import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {ActivatedRoute} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';

@Component({
  selector: 'sic-com-producto',
  templateUrl: 'producto.component.html',
  styleUrls: ['producto.component.scss']
})
export class ProductoComponent implements OnInit {

  producto;
  cantidad;
  loadingProducto = false;

  constructor(private productosService: ProductosService, private route: ActivatedRoute,
              private carritoCompraService: CarritoCompraService, private location: Location,
              private avisoService: AvisoService) {}

  ngOnInit() {
    const productoId = Number(this.route.snapshot.params['id']);
    this.getProducto(productoId);
  }

  getProducto(id: number) {
    this.loadingProducto = true;
    this.productosService.getProducto(id).subscribe(
      data => {
        this.producto = data;
        this.cantidad = data['ventaMinima'];
        this.loadingProducto = false;
      },
      err => {
        this.loadingProducto = false;
        this.avisoService.openSnackBar(err.error, '', 3500);
      });
  }

  irAlListado() {
    this.location.back();
  }

  cargarAlCarrito() {
    this.carritoCompraService.agregarQuitarAlPedido(this.producto, this.cantidad).subscribe(
      data => {
        this.carritoCompraService.getCantidadRenglones().subscribe(
          cant => {
            this.carritoCompraService.setCantidadItemsEnCarrito(Number(cant));
            this.irAlListado();
          },
          err => this.avisoService.openSnackBar(err.error, '', 3500));
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  cambiarCantidad(cantidad, masMenos) {
    if (masMenos === 1) {
      this.cantidad = parseFloat(cantidad) + 1;
    } else {
      if (cantidad > 1) {
        this.cantidad = parseFloat(cantidad) - 1;
      } else {
        this.cantidad = 1;
      }
    }
  }
}
