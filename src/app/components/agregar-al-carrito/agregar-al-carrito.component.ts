import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CarritoCompraService } from '../../services/carrito-compra.service';
import { AvisoService } from '../../services/aviso.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { Producto } from '../../models/producto';
import { finalize } from 'rxjs/operators';
import { ItemCarritoCompra } from '../../models/item-carrito-compra';
import { CarritoCompra } from '../../models/carrito-compra';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'sic-com-agregar-al-carrito',
  templateUrl: './agregar-al-carrito.component.html',
  styleUrls: ['./agregar-al-carrito.component.scss']
})
export class AgregarAlCarritoComponent implements OnInit {

  @Input() set cliente(value: Cliente) { this.pCliente = value; }
  @Input() set producto(value: Producto) { this.pProducto = value; }
  @Output() cantidadUpdated = new EventEmitter<number>();
  @Output() loadingStatusUpdated = new EventEmitter<boolean>();
  @Output() validStatusChanged = new EventEmitter<boolean>();

  private pCliente: Cliente;
  private pProducto: Producto;
  cantidadEnCarrito = 0;
  form: UntypedFormGroup;
  private pLoading = false;
  valid = false;
  defaultValidatos = [Validators.required, Validators.min(1), Validators.pattern('[0-9]*')];

  get cliente(): Cliente {
    return this.pCliente;
  }

  get producto(): Producto {
    return this.pProducto;
  }

  set loading(value: boolean) {
    this.pLoading = value;
    this.loadingStatusUpdated.emit(value);
  }

  get loading(): boolean {
    return this.pLoading;
  }

  constructor(private readonly carritoCompraService: CarritoCompraService,
    private readonly avisoService: AvisoService,
    private readonly fb: UntypedFormBuilder,
    public helper: HelperService) { }

  ngOnInit() {
    this.createForm();
    if (this.cliente) {
      this.loading = true;
      this.carritoCompraService.getCantidadEnCarrito(this.producto.idProducto)
        .pipe(finalize(() => this.loading = false))
        .subscribe((icc: ItemCarritoCompra) => {
          const validators = this.defaultValidatos.map(v => v);
          validators.push(Validators.max(this.producto.cantidadTotalEnSucursalesDisponible));
          this.form.get('cantidad').setValidators(validators);
          this.form.get('cantidad').setValue(icc ? icc.cantidad : 1);
          this.cantidadEnCarrito = icc ? icc.cantidad : 0;
        });
    }
  }

  createForm() {
    this.form = this.fb.group({
      cantidad: [1, this.defaultValidatos]
    });
    this.form.valueChanges.subscribe(() => {
      if (this.valid !== this.form.valid) {
        this.valid = this.form.valid;
        this.validStatusChanged.emit(this.valid);
      }
    });
  }

  decCantidad() {
    const val = parseInt(this.form.get('cantidad').value, 10);
    let cant = !isNaN(val) ? val : 1;
    if (cant > 1) { cant -= 1; }
    this.form.get('cantidad').setValue(cant);
  }

  incCantidad() {
    const val = parseInt(this.form.get('cantidad').value, 10);
    let cant = !isNaN(val) ? val : 0;
    cant += 1;
    this.form.get('cantidad').setValue(cant);
  }

  submit() {
    if (this.form.valid) {
      const cantidad = this.form.get('cantidad').value;
      this.loading = true;
      this.carritoCompraService.actualizarAlPedido(this.producto, cantidad)
        .subscribe(
          () => {
            if (this.cliente) {
              this.carritoCompraService.getCarritoCompra()
                .pipe(finalize(() => this.loading = false))
                .subscribe(
                  (carrito: CarritoCompra) => {
                    this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones);
                    this.cantidadUpdated.emit(cantidad);
                  },
                  err => {
                    this.avisoService.openSnackBar(err.error, '', 3500);
                  }
                );
            } else {
              this.cantidadUpdated.emit(cantidad);
              this.loading = false;
            }
          },
          err => {
            this.loading = false;
            this.avisoService.openSnackBar(err.error, '', 3500);
          }
        );
    }
  }

  esCantidadBonificada() {
    const cant = this.form && this.form.get('cantidad') ? this.form.get('cantidad').value : null;
    if (!cant || cant < 0) { return false; }
    return this.producto.precioBonificado && this.producto.precioBonificado < this.producto.precioLista
      && cant >= this.producto.cantMinima;
  }
}
