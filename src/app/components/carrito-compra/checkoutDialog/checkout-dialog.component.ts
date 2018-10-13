import {Component, OnInit, Inject} from '@angular/core';
import {CarritoCompraService} from '../../../services/carrito-compra.service';
import {ClientesService} from '../../../services/clientes.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AvisoService} from '../../../services/aviso.service';
import {AuthService} from '../../../services/auth.service';
import {OrdenCompra} from '../../../models/orden-compra';

@Component({
  selector: 'sic-com-checkout',
  templateUrl: './checkout-dialog.component.html',
  styleUrls: ['./checkout-dialog.component.scss']
})
export class CheckoutDialogComponent implements OnInit {

  cliente;
  observaciones;
  loggedInIdUsuario;
  loadingData = false;

  constructor(private carritoCompraService: CarritoCompraService,
              private authService: AuthService,
              private clientesService: ClientesService,
              private avisoService: AvisoService,
              private dialogRef: MatDialogRef<CheckoutDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: OrdenCompra) {}

  ngOnInit() {
    this.cliente = this.clientesService.getClienteSeleccionado();
    this.loggedInIdUsuario = this.authService.getLoggedInIdUsuario();
  }

  enviarOrden() {
    this.loadingData = true;
    this.data.observaciones = this.observaciones;
    this.carritoCompraService.enviarOrden(this.data, this.cliente['idEmpresa'],
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
