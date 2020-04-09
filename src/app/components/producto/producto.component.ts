import {Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {ClientesService} from '../../services/clientes.service';
import {Cliente} from '../../models/cliente';
import {Location} from '@angular/common';
import {finalize} from 'rxjs/operators';
import {AgregarAlCarritoComponent} from '../agregar-al-carrito/agregar-al-carrito.component';

@Component({
  selector: 'sic-com-producto',
  templateUrl: 'producto.component.html',
  styleUrls: ['producto.component.scss']
})
export class ProductoComponent implements OnInit {
  producto: Producto;
  loadingProducto = false;

  cliente: Cliente = null;
  loadingCliente = false;

  imgViewerVisible = false;

  @ViewChild('aacc', { static: false }) aacc: AgregarAlCarritoComponent;
  aaccLoading = false;

  constructor(private productosService: ProductosService,
              private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              public authService: AuthService,
              private clientesService: ClientesService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit() {
    const productoId = Number(this.route.snapshot.params['id']);
    this.loadingProducto = true;
    this.productosService.getProductoSoloPublico(productoId)
      .pipe(finalize(() => this.loadingProducto = false))
      .subscribe(
        data => {
          this.producto = data;
          if (this.producto.urlImagen == null || this.producto.urlImagen === '') {
            this.producto.urlImagen = 'https://res.cloudinary.com/hf0vu1bg2/image/upload/v1545616229/assets/sin_imagen.png';
          }
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.volver();
        }
      )
    ;

    if (this.authService.isAuthenticated()) {
      this.loadingCliente = true;
      this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
        .pipe(finalize(() => this.loadingCliente = false))
        .subscribe((cliente: Cliente) => this.cliente = cliente)
      ;
    }
  }

  volver() {
    this.location.back();
  }

  toggleImgViewer() {
    this.imgViewerVisible = !this.imgViewerVisible;
  }

  aaccSubmit() {
    this.aacc.submit();
  }

  onCantidadUpdated() {
    this.volver();
  }

  onLoadingStatusUpdated(loadingStatus: boolean) {
    this.aaccLoading = loadingStatus;
  }
}
