import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Pedido } from '../../models/pedido';
import { AvisoService } from '../../services/aviso.service';
import { EstadoPedido } from '../../models/estado.pedido';
import { NuevoReciboDeposito } from '../../models/nuevo-recibo-deposito';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecibosService } from '../../services/recibos.service';

@Component({
  selector: 'sic-com-transferencia-bancaria',
  templateUrl: './transferencia-bancaria.component.html',
  styleUrls: ['./transferencia-bancaria.component.scss']
})
export class TransferenciaBancariaComponent implements OnInit {
  imageDataUrl = '';
//  imagen: number[] = [];
  loading = false;
  pedido: Pedido = null;
  form: FormGroup;

  constructor(private route: ActivatedRoute,
              private pedidosService: PedidosService,
              private avisoService: AvisoService,
              private router: Router,
              private fb: FormBuilder,
              private recibosService: RecibosService) {
  }

  ngOnInit() {
    const idPedido = Number(this.route.snapshot.queryParams['idPedido']);
    if (idPedido) {
      this.loading = true;
      this.pedidosService.getPedido(idPedido)
        .pipe(finalize(() => this.loading = false))
        .subscribe(
          (pedido: Pedido) => {
            if (pedido.estado !== EstadoPedido.ABIERTO) {
              const msg = [
                'El pedido #', pedido.nroPedido,
                'se encuentra en estado ', pedido.estado, '. ',
                'Sole se pueden realizar transferencias a pedidos en estado ', EstadoPedido.ABIERTO, '.'
              ].join('');
              this.avisoService.openSnackBar(msg, 'Cerrar', 0).afterDismissed().subscribe(
                () => this.router.navigate([''])
              );
            } else {
              this.pedido = pedido;
              this.createForm();
            }
          },
          err => {
            this.avisoService.openSnackBar(err.error, 'Cerrar', 0);
            this.router.navigate(['']);
          }
        )
      ;
    } else {
      this.createForm();
    }
  }

  createForm() {
    const monto = this.pedido ? this.pedido.total : 0;
    const concepto = this.pedido ? `Depósito por Pedido Nº ${this.pedido.nroPedido}` : 'Depósito para Cuenta Corriente';
    const isMontoDisabled = !!this.pedido;

    this.form = this.fb.group({
      monto: [{ value: monto , disabled: isMontoDisabled }, [Validators.required, Validators.min(1)]],
      concepto: concepto,
      imagen: [[], Validators.required],
    });
  }

  imageChange($event) {
    if (!$event.target.files.length) {
      return;
    }

    const file = $event.target.files[0];
    const readerBuffer = new FileReader();
    const readerDataUrl = new FileReader();

    readerBuffer.addEventListener('load', () => {
      const arr = new Uint8Array(readerBuffer.result as ArrayBuffer);
      this.form.get('imagen').setValue(Array.from(arr));
    });

    readerDataUrl.addEventListener('load', () => {
      this.imageDataUrl = readerDataUrl.result as string;
    });

    readerBuffer.readAsArrayBuffer(file);
    readerDataUrl.readAsDataURL(file);
  }

  submit() {
    console.log(this.form.value);
    if (this.form.valid) {
      const formValues = this.form.value;
      const nrd: NuevoReciboDeposito = {
        idSucursal: null, // se completa en pagosService
        idPedido: this.pedido ? this.pedido.idPedido : null,
        imagen: formValues.imagen,
        monto: formValues.monto,
        concepto: formValues.concepto,
      };

      this.loading = true;
      this.recibosService.generarReciboDeposito(nrd)
        .pipe(finalize(() => this.loading = false))
        .subscribe(
          () => {
            const msg = 'Comprobante recibido correctamente.';
            this.avisoService.openSnackBar(msg, 'Cerrar', 0).afterDismissed().subscribe(
              () => this.router.navigate(['/perfil'])
            );
          },
          err => this.avisoService.openSnackBar(err.error, 'Cerrar', 0),
        )
      ;
    }
  }
}
