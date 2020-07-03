import {Component, OnInit, ViewChild} from '@angular/core';
import {Producto} from '../../models/producto';
import { MatDialogRef } from '@angular/material/dialog';
import {Cliente} from '../../models/cliente';
import {AgregarAlCarritoComponent} from '../agregar-al-carrito/agregar-al-carrito.component';

@Component({
  selector: 'sic-com-agregar-al-carrito-dialog',
  templateUrl: './agregar-al-carrito-dialog.component.html',
  styleUrls: ['./agregar-al-carrito-dialog.component.scss']
})
export class AgregarAlCarritoDialogComponent implements OnInit {
  producto: Producto;
  cliente: Cliente;

  @ViewChild('aacc', { static: false }) aacc: AgregarAlCarritoComponent;
  aaccLoading = false;

  cantidadValida = false;

  constructor(private dialogRef: MatDialogRef<AgregarAlCarritoDialogComponent>) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  aaccSubmit() {
    this.aacc.submit();
  }

  onCantidadUpdated() {
    this.dialogRef.close(true);
  }

  onLoadingStatusUpdated(loadingStatus: boolean) {
    this.aaccLoading = loadingStatus;
  }

  onValidStatusChanged(valid: boolean) {
    this.cantidadValida = valid;
  }
}
