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
import {formatNumber, Location} from '@angular/common';
import {finalize} from 'rxjs/operators';
import {ItemCarritoCompra} from '../../models/item-carrito-compra';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'sic-com-producto',
  templateUrl: 'producto.component.html',
  styleUrls: ['producto.component.scss']
})
export class ProductoComponent implements OnInit {
  producto: Producto;
  cantidadEnCarrito = 0;
  loadingProducto = false;
  cargandoAlCarrito = false;
  cliente: Cliente = null;
  imgViewerVisible = false;

  form: FormGroup;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              public authService: AuthService,
              private clientesService: ClientesService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    const productoId = Number(this.route.snapshot.params['id']);
    if (this.authService.isAuthenticated()) {
      this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario()).subscribe(
        (cliente: Cliente) => this.cliente = cliente
      );
    }
    this.createForm();
    this.getProducto(productoId);
  }

  createForm() {
    this.form = this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  getProducto(id: number) {
    this.loadingProducto = true;
    this.loadingProducto = true;
    this.productosService.getProductoSoloPublico(id).subscribe(
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
                this.form.get('cantidad').setValue(icc ? icc.cantidad : 1);
                this.form.get('cantidad').setValidators(
                  [Validators.required, Validators.min(1), Validators.max(this.producto.cantidadTotalEnSucursales)]
                );
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
        this.volver();
      });
  }

  volver() {
    this.location.back();
  }

  submit() {
    if (this.form.valid) {
      const cantidad = this.form.get('cantidad').value;
      this.cargandoAlCarrito = true;
      this.carritoCompraService.actualizarAlPedido(this.producto, cantidad)
        .subscribe(
          () => {
            if (this.cliente) {
              this.carritoCompraService.getCarritoCompra(this.cliente.idCliente)
                .pipe(finalize(() => this.cargandoAlCarrito = false))
                .subscribe(
                  (carrito: CarritoCompra) => {
                    this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones);
                    this.volver();
                  },
                  err => this.avisoService.openSnackBar(err.error, '', 3500),
                )
              ;
            }
          },
          err => {
            this.cargandoAlCarrito = false;
            this.avisoService.openSnackBar(err.error, '', 3500);
          }
        )
      ;
    }
  }

  decCanitdad() {
    let cant = this.form.get('cantidad').value ? this.form.get('cantidad').value : 1;
    if (cant > 1) { cant -= 1; }
    this.form.get('cantidad').setValue(cant);
  }

  incCantidad() {
    let cant = this.form.get('cantidad').value ? this.form.get('cantidad').value : 1;
    cant += 1;
    this.form.get('cantidad').setValue(cant);
  }

  esCantidadBonificada() {
    const cant = this.form && this.form.get('cantidad') ? this.form.get('cantidad').value : null;
    if (!cant || cant < 0) { return false; }

    return this.producto.precioBonificado && this.producto.precioBonificado < this.producto.precioLista
      && cant >= this.producto.bulto;
  }

  toggleImgViewer() {
    this.imgViewerVisible = !this.imgViewerVisible;
  }
}
