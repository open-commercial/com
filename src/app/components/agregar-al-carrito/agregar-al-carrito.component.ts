import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CarritoCompraService} from '../../services/carrito-compra.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Cliente} from '../../models/cliente';
import {Producto} from '../../models/producto';
import {finalize} from 'rxjs/operators';
import {ItemCarritoCompra} from '../../models/item-carrito-compra';
import {CarritoCompra} from '../../models/carrito-compra';

@Component({
  selector: 'sic-com-agregar-al-carrito',
  templateUrl: './agregar-al-carrito.component.html',
  styleUrls: ['./agregar-al-carrito.component.scss']
})
export class AgregarAlCarritoComponent implements OnInit, AfterViewInit {
  private pCliente: Cliente;
  @Input() set cliente(value: Cliente) {
    this.pCliente = value;
  }
  get cliente(): Cliente {
    return this.pCliente;
  }

  private pProducto: Producto;
  @Input() set producto(value: Producto) {
    this.pProducto = value;
  }
  get producto(): Producto {
    return this.pProducto;
  }

  cantidadEnCarrito = 0;

  form: FormGroup;
  @Output() cantidadUpdated = new EventEmitter<number>();
  @Output() loadingStatusUpdated = new EventEmitter<boolean>();
  @Output() validStatusChanged = new EventEmitter<boolean>();

  private pLoading = false;
  set loading(value: boolean) {
    this.pLoading = value;
    this.loadingStatusUpdated.emit(value);
  }
  get loading(): boolean {
    return this.pLoading;
  }

  valid = false;

  @ViewChild('cantInput', { static: false }) cantInput: ElementRef;

  constructor(private carritoCompraService: CarritoCompraService,
              private avisoService: AvisoService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.createForm();
    if (this.cliente) {
      this.loading = true;
      this.carritoCompraService.getCantidadEnCarrito(this.producto.idProducto)
        .pipe(finalize(() => this.loading = false))
        .subscribe((icc: ItemCarritoCompra) => {
          this.form.get('cantidad').setValidators(
            [Validators.required, Validators.min(1), Validators.max(this.producto.cantidadTotalEnSucursales)]
          );
          this.form.get('cantidad').setValue(icc ? icc.cantidad : 1);
          this.cantidadEnCarrito = icc ? icc.cantidad : 0;
        })
      ;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.cantInput) { this.cantInput.nativeElement.focus(); }
    }, 1000);
  }

  createForm() {
    this.form = this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
    this.form.valueChanges.subscribe(() => {
      if (this.valid !== this.form.valid) {
        this.valid = this.form.valid;
        this.validStatusChanged.emit(this.valid);
      }
    });
  }

  decCantidad() {
    let cant = this.form.get('cantidad').value ? this.form.get('cantidad').value : 1;
    if (cant > 1) { cant -= 1; }
    this.form.get('cantidad').setValue(cant);
  }

  incCantidad() {
    let cant = this.form.get('cantidad').value ? this.form.get('cantidad').value : 0;
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
              this.carritoCompraService.getCarritoCompra(this.cliente.idCliente)
                .pipe(finalize(() => this.loading = false))
                .subscribe(
                  (carrito: CarritoCompra) => {
                    this.carritoCompraService.setCantidadItemsEnCarrito(carrito.cantRenglones);
                    this.cantidadUpdated.emit(cantidad);
                  },
                  err => {
                    this.avisoService.openSnackBar(err.error, '', 3500);
                  }
                )
              ;
            } else {
              this.cantidadUpdated.emit(cantidad);
              this.loading = false;
            }
          },
          err => {
            this.loading = false;
            this.avisoService.openSnackBar(err.error, '', 3500);
          }
        )
      ;
    }
  }

  esCantidadBonificada() {
    const cant = this.form && this.form.get('cantidad') ? this.form.get('cantidad').value : null;
    if (!cant || cant < 0) { return false; }

    return this.producto.precioBonificado && this.producto.precioBonificado < this.producto.precioLista
      && cant >= this.producto.bulto;
  }
}
