import {Component, Input, OnInit} from '@angular/core';
import {Producto} from '../../models/producto';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Cliente} from '../../models/cliente';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'sic-com-producto-card',
  templateUrl: './producto-card.component.html',
  styleUrls: ['./producto-card.component.scss']
})
export class ProductoCardComponent implements OnInit {
  private pProducto: Producto;
  @Input() set producto(value: Producto) { this.pProducto = value; }
  get producto() { return this.pProducto; }

  private pCliente: Cliente;
  @Input() set cliente(value: Cliente) { this.pCliente = value; }
  get cliente() { return this.pCliente; }

  private pStretchOnMobile = false;
  @Input() set stretchOnMobile(value: boolean) { this.pStretchOnMobile = value; }
  get stretchOnMobile() { return this.pStretchOnMobile; }

  constructor(private authService: AuthService, private dialog: MatDialog) { }

  ngOnInit() {
  }

  showDialogCantidad($event, producto: Producto) {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    $event.stopPropagation();
    dialogRef.componentInstance.producto = producto;
    dialogRef.componentInstance.cliente = this.cliente;
  }

}
