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
  total = 0;
  cantArt = 0;
  observaciones;
  empresa;
  loggedInIdUsuario;
  loadingData = false;

  constructor(private carritoCompraService: CarritoCompraService, private authService: AuthService,
              private clientesService: ClientesService, private avisoService: AvisoService,
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

  enviarPedido() {
    this.loadingData = true;
    const defaultMsj = 'Los precios se encuentran sujetos a modificaciones.';
    const observaciones = this.observaciones ? this.observaciones : defaultMsj;
    const fecha = new Date();
    const pedido = {
      'id_Pedido': 0,
      'fecha': fecha.getTime() - (fecha.getTimezoneOffset() * 60000),
      'observaciones': observaciones,
      'totalEstimado': this.total
    };
    this.carritoCompraService.enviarOrden(pedido, this.cliente['idEmpresa'],
      this.loggedInIdUsuario, this.cliente['id_Cliente']).subscribe(
      data => {
        data = JSON.parse(data);
        this.loadingData = false;
        const mensaje = 'El pedido Nro ' + data['nroPedido'] + ' fué generado correctamente';
        const accion = 'OK';
        const duracion = 0;
        this.avisoService.openSnackBar(mensaje, accion, duracion);
        this.clientesService.deleteClienteSeleccionado();
        this.carritoCompraService.setCantidadItemsEnCarrito(0);
        this.cerrarDialog(true);
      },
      error => {
        let mensaje = '';
        const accion = 'OK';
        const duracion = 0;
        if (error.status === 404) {
          mensaje = 'No se encontró el servidor. Error: ' + error.status;
        } else if (error.status === 0) {
          mensaje = 'No se pudo enviar el pedido ';
        } else {
          mensaje = error.error;
        }
        this.loadingData = false;
        this.avisoService.openSnackBar(mensaje, accion, duracion);
      });
  }

  cerrarDialog(limpiar: boolean) {
    this.dialogRef.close(limpiar);
  }
}
