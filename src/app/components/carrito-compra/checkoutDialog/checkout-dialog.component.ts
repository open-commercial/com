import {Component, OnInit} from '@angular/core';
import {CarritoCompraService} from '../../../services/carrito-compra.service';
import {ClientesService} from '../../../services/clientes.service';
import {MatDialogRef} from '@angular/material';
import {AvisoService} from '../../../services/aviso.service';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'sic-com-checkout',
  templateUrl: './checkout-dialog.component.html',
  styleUrls: ['./checkout-dialog.component.scss']
})
export class CheckoutDialogComponent implements OnInit {

  cliente;
  subTotal = 0;
  descuentoPorcentaje = 0;
  descuentoNeto = 0;
  total = 0;
  cantArt = 0;
  observaciones;
  loggedInIdUsuario;
  loadingData = false;

  constructor(private carritoCompraService: CarritoCompraService,
              private authService: AuthService,
              private clientesService: ClientesService,
              private avisoService: AvisoService,
              private dialogRef: MatDialogRef<CheckoutDialogComponent>) {}

  ngOnInit() {
    this.cliente = this.clientesService.getClienteSeleccionado();
    this.carritoCompraService.getTotalImportePedido().subscribe(
      data => this.total = parseFloat(data.toString()),
      err => this.avisoService.openSnackBar(err.error, '', 3500));
    this.loggedInIdUsuario = this.authService.getLoggedInIdUsuario();
    this.carritoCompraService.getCantidadArticulos().subscribe(
      data => this.cantArt = Number(data),
      err => this.avisoService.openSnackBar(err.error, '', 3500));
  }

  enviarOrden() {
    this.loadingData = true;
    const ordenDeCompra = {
      'observaciones': this.observaciones,
      'subTotal': this.total, // cambiar
      'recargoPorcentaje': 0,
      'recargoNeto': 0,
      'descuentoPorcentaje': this.descuentoPorcentaje,
      'descuentoNeto': this.descuentoNeto,
      'total': this.total
    };
    this.carritoCompraService.enviarOrden(ordenDeCompra, this.cliente['idEmpresa'],
      this.loggedInIdUsuario, this.cliente['id_Cliente']).subscribe(
      data => {
        this.loadingData = false;
        const mensaje = 'El pedido Nro ' + data['nroPedido'] + ' fué generado correctamente';
        this.avisoService.openSnackBar(mensaje, '', 3500);
        this.clientesService.deleteClienteSeleccionado();
        this.carritoCompraService.setCantidadItemsEnCarrito(0);
        this.cerrarDialog(true);
      },
      err => {
        this.loadingData = false;
        this.avisoService.openSnackBar(err.error, '', 3500);
      });
  }

  cerrarDialog(limpiar: boolean) {
    this.dialogRef.close(limpiar);
  }
}
