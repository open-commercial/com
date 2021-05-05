import {Component, OnInit} from '@angular/core';
import {Pedido} from '../../models/pedido';
import {Cliente} from '../../models/cliente';
import {PedidosService} from '../../services/pedidos.service';
import {AvisoService} from '../../services/aviso.service';
import {ClientesService} from '../../services/clientes.service';
import {AuthService} from '../../services/auth.service';
import { saveAs } from 'file-saver';
import {finalize} from 'rxjs/operators';
import { Router } from '@angular/router';
import { EstadoPedido } from '../../models/estado.pedido';

@Component({
  selector: 'sic-com-pedidos',
  templateUrl: 'pedidos.component.html',
  styleUrls: ['pedidos.component.scss']
})
export class PedidosComponent implements OnInit {
  cliente: Cliente = null;
  pedidos: Array<Pedido> = [];
  pagina = 0;
  totalPaginas = 0;
  isLoading = true;
  loading = true;

  estadoPedido = EstadoPedido;

  constructor(private router: Router,
              private pedidosService: PedidosService,
              private avisoService: AvisoService,
              private authService: AuthService,
              private clientesService: ClientesService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
      .subscribe(
        (cliente: Cliente) => {
          if (cliente) {
            this.cliente = cliente;
            this.cargarPedidos(true);
          } else {
            this.isLoading = false;
          }
        },
        err => {
          this.isLoading = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }

  cargarPedidos(reset: boolean) {
    if (reset) {
      this.pagina = 0;
    }
    this.loading = true;
    this.pedidosService.getPedidosCliente(this.cliente, this.pagina)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isLoading = false;
        })
      )
      .subscribe(
        data => {
          if (reset) {
            this.pedidos = [];
            this.pagina = 0;
          }

          data['content'].forEach(p => this.pedidos.push(p));
          this.totalPaginas = data['totalPages'];
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }

  masPedidos() {
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarPedidos(false);
    }
  }

  downloadPedidoPdf(pedido: Pedido) {
    this.pedidosService.getPedidoPdf(pedido).subscribe(
      (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        saveAs(file, `pedido-${pedido.nroPedido}.pdf`);
      }
    );
  }

  transferenciaPedido(pedido: Pedido) {
    this.router.navigate(['/pagos/transferencia'], { queryParams: { idPedido: pedido.idPedido}});
  }
}
