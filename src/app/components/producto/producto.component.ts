import {Component, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {ClientesService} from '../../services/clientes.service';
import {Cliente} from '../../models/cliente';
import {CarritoCompra} from '../../models/carrito-compra';

@Component({
  selector: 'sic-com-producto',
  templateUrl: 'producto.component.html',
  styleUrls: ['producto.component.scss']
})
export class ProductoComponent implements OnInit {

  producto;
  cantidad;
  loadingProducto = false;
  cargandoAlCarrito = false;
  cliente: Cliente = null;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private clienteService: ClientesService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const productoId = Number(this.route.snapshot.params['id']);
    if (this.authService.isAuthenticated()) {
      this.clienteService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
        (cliente: Cliente) => this.cliente = cliente
      );
    }
    this.getProducto(productoId);
  }

  getProducto(id: number) {
    this.loadingProducto = true;
    this.productosService.getProducto(id, this.authService.isAuthenticated()).subscribe(
      data => {
        this.producto = data;
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
          if (this.cliente) {
            this.carritoCompraService.getCarritoCompra(this.cliente.id_Cliente)
              .subscribe(
                (carrito: CarritoCompra) => {
                  this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones);
                  this.irAlListado();
                  this.cargandoAlCarrito = false;
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
    return this.authService.isAuthenticated() && this.producto.precioListaBonificado !== this.producto.precioLista;
  }
}
