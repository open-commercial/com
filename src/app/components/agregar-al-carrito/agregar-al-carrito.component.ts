import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Producto} from '../../models/producto';
import {MatDialog, MatDialogRef} from '@angular/material';
import {AgregarAlCarritoDialogComponent} from './agregarAlCarritoDialog/agregar-al-carrito-dialog.component';

@Component({
  selector: 'sic-com-agregar-al-carrito',
  templateUrl: './agregar-al-carrito.component.html',
  styleUrls: ['./agregar-al-carrito.component.scss']
})
export class AgregarAlCarritoComponent implements OnInit {
  @Input() producto: Producto;

  constructor(private authService: AuthService,
              private dialog: MatDialog) { }

  ngOnInit() {
  }

  agregarAlCarrito() {
    const dialogRef = this.dialog.open(AgregarAlCarritoDialogComponent);
    dialogRef.componentInstance.producto = this.producto;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(dialogRef.componentInstance.cantidad);
      }
    });
  }
}

