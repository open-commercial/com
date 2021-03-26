import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Pedido } from '../../models/pedido';
import { AvisoService } from '../../services/aviso.service';
import { EstadoPedido } from '../../models/estado.pedido';
import { NuevoRecibo } from '../../models/nuevo-recibo';
import { PagosService } from '../../services/pagos.service';

@Component({
  selector: 'sic-com-transferencia-bancaria',
  templateUrl: './transferencia-bancaria.component.html',
  styleUrls: ['./transferencia-bancaria.component.scss']
})
export class TransferenciaBancariaComponent implements OnInit {
  imageDataUrl = '';
  imagen: number[] = [];
  loading = false;
  pedido: Pedido = null;

  constructor(private route: ActivatedRoute,
              private pedidosService: PedidosService,
              private avisoService: AvisoService,
              private router: Router,
              private pagosService: PagosService) {
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
            }
          },
          err => {
            this.avisoService.openSnackBar(err.error, 'Cerrar', 0);
            this.router.navigate(['']);
          }
        )
      ;
    }
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
      this.imagen = Array.from(arr);
    });

    readerDataUrl.addEventListener('load', () => {
      this.imageDataUrl = readerDataUrl.result as string;
    });

    readerBuffer.readAsArrayBuffer(file);
    readerDataUrl.readAsDataURL(file);
  }

  aceptar() {
    if (this.imagen.length) {
      const nr: NuevoRecibo = {
        imagen: this.imagen,
        idPedido: this.pedido ? this.pedido.idPedido : null,
      };

      this.loading = true;
      this.pagosService.pagoTransferencia(nr)
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
