import {Component, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {ClientesService} from '../../services/clientes.service';
import {Cliente} from '../../models/cliente';
import {CarritoCompra} from '../../models/carrito-compra';
import {Location} from '@angular/common';
import {finalize} from 'rxjs/operators';
import {ItemCarritoCompra} from '../../models/item-carrito-compra';

@Component({
  selector: 'sic-com-producto',
  templateUrl: 'producto.component.html',
  styleUrls: ['producto.component.scss']
})
export class ProductoComponent implements OnInit {

  producto: Producto;
  cantidad = 1;
  cantidadEnCarrito = 0;
  loadingProducto = false;
  cargandoAlCarrito = false;
  cliente: Cliente = null;
  imgViewerVisible = false;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private clientesService: ClientesService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit() {
    const productoId = Number(this.route.snapshot.params['id']);
    if (this.authService.isAuthenticated()) {
      this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
        (cliente: Cliente) => this.cliente = cliente
      );
    }
    this.getProducto(productoId);
  }

  getProducto(id: number) {
    this.loadingProducto = true;
    this.productosService.getProducto(id).subscribe(
      data => {
        this.producto = data;
        if (this.producto.urlImagen == null || this.producto.urlImagen === '') {
          this.producto.urlImagen = 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1545616229/assets/sin_imagen.png';
        }
        if (this.authService.isAuthenticated()) {
          this.carritoCompraService.getCantidadEnCarrito(this.producto.idProducto)
            .pipe(finalize(() => this.loadingProducto = false))
            .subscribe(
              (icc: ItemCarritoCompra) => {
                this.cantidad = icc ? icc.cantidad : 1;
                this.cantidadEnCarrito = icc ? icc.cantidad : 0;
              },
              err => this.avisoService.openSnackBar(err.error, '', 3500)
            )
          ;
        } else {
          this.loadingProducto = false;
        }
      },
      err => {
        this.loadingProducto = false;
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.irAlListado();
      });
  }

  irAlListado() {
    this.location.back();
  }

  cargarAlCarrito() {
    this.cargandoAlCarrito = true;
    this.carritoCompraService.actualizarAlPedido(this.producto, this.cantidad)
      .subscribe(
        data => {
          if (this.cliente) {
            this.carritoCompraService.getCarritoCompra(this.cliente.id_Cliente)
              .subscribe(
                (carrito: CarritoCompra) => {
                  this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones);
                  this.irAlListado();
                  this.cargandoAlCarrito = false;
                  this.avisoService.openSnackBar('Tu carrito de compra fué modificado', 'Ver', 1500)
                    .onAction()
                    .subscribe(() => this.router.navigate(['/carrito-compra']));
                },
                err => {
                  this.avisoService.openSnackBar(err.error, '', 3500);
                  this.cargandoAlCarrito = false;
                }
              );
          }
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

  esProductoBonificado() {
    return this.authService.isAuthenticated() && this.producto.precioBonificado !== this.producto.precioLista;
  }

  toggleImgViewer() {
    this.imgViewerVisible = !this.imgViewerVisible;
  }
}
