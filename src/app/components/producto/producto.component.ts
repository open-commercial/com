import {Component, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';

@Component({
  selector: 'sic-com-producto',
  templateUrl: 'producto.component.html',
  styleUrls: ['producto.component.scss']
})
export class ProductoComponent implements OnInit {

  producto: Producto;
  cantidad;
  loadingProducto = false;
  cargandoAlCarrito = false;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const productoId = Number(this.route.snapshot.params['id']);
    this.getProducto(productoId);
  }

  getProducto(id: number) {
    this.loadingProducto = true;
    this.productosService.getProducto(id).subscribe(
      data => {
        this.producto = data;
        if (this.producto.urlImagen == null || this.producto.urlImagen === '') {
          this.producto.urlImagen = '../../../assets/no-image.png';
        }
        this.cantidad = 1;
        this.loadingProducto = false;
      },
      err => {
        this.loadingProducto = false;
        this.avisoService.openSnackBar(err.error, '', 3500);
      });
  }

  irAlListado() {
    this.router.navigateByUrl('/productos;busqueda=' + this.productosService.getBusquedaCriteria());
  }

  cargarAlCarrito() {
    this.cargandoAlCarrito = true;
    this.carritoCompraService.agregarQuitarAlPedido(this.producto, this.cantidad)
      .subscribe(
        data => {
          this.carritoCompraService.getCantidadRenglones()
            .subscribe(
              cant => {
                this.carritoCompraService.setCantidadItemsEnCarrito(Number(cant));
                this.irAlListado();
                this.cargandoAlCarrito = false;
              },
              err => {
                this.avisoService.openSnackBar(err.error, '', 3500);
                this.cargandoAlCarrito = false;
              }
            );
        },
        err => {
          this.cargandoAlCarrito = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
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
