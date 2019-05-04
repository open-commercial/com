import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {MatDialog} from '@angular/material';
import {AgregarAlCarritoDialogComponent} from '../agregar-al-carrito-dialog/agregar-al-carrito-dialog.component';
import {Cliente} from '../../models/cliente';

@Component({
  selector: 'sic-com-agregar-al-carrito',
  templateUrl: './agregar-al-carrito.component.html',
  styleUrls: ['./agregar-al-carrito.component.scss']
})
export class AgregarAlCarritoComponent implements OnInit {
  @Input() producto: Producto;
  @Input() cliente: Cliente;

  constructor(private authService: AuthService,
              private dialog: MatDialog) { }

  ngOnInit() {
  }

  showDialog($event) {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    $event.stopPropagation();
    dialogRef.componentInstance.producto = this.producto;
    dialogRef.componentInstance.cliente = this.cliente;
  }
}

