import {Component, Input} from '@angular/core';
import {Producto} from '../../models/producto';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Cliente} from '../../models/cliente';
import {AuthService} from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'sic-com-producto-card',
  templateUrl: './producto-card.component.html',
  styleUrls: ['./producto-card.component.scss']
})
export class ProductoCardComponent {
  private pProducto: Producto;
  @Input() set producto(value: Producto) { this.pProducto = value; }
  get producto() { return this.pProducto; }

  private pCliente: Cliente;
  @Input() set cliente(value: Cliente) { this.pCliente = value; }
  get cliente() { return this.pCliente; }

  constructor(
    public readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) { }

  showDialogCantidad($event, producto: Producto) {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    $event.stopPropagation();
    $event.preventDefault();
    dialogRef.componentInstance.producto = producto;
    dialogRef.componentInstance.cliente = this.cliente;
  }

  irAlProducto($event, producto: Producto) {
    $event.preventDefault();
    this.router.navigateByUrl('', {skipLocationChange: true})
      .then(() => this.router.navigate(['/producto', producto.idProducto]));
  }
}
