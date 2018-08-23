import {Component, OnInit} from '@angular/core';
import {Pedido} from '../../models/pedido';
import {Cliente} from '../../models/cliente';
import {PedidosService} from '../../services/pedidos.service';
import {AvisoService} from '../../services/aviso.service';
import {ClientesService} from '../../services/clientes.service';
import {AuthService} from '../../services/auth.service';
import {saveAs} from 'file-saver/FileSaver';

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
  tamanioPagina = 5;
  isLoading = false;

  constructor(private pedidosService: PedidosService, private avisoService: AvisoService,
              private authService: AuthService, private clientesService: ClientesService) {
    this.isLoading = true;
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
      this.pedidos = [];
      this.pagina = 0;
    }
    this.isLoading = true;
    this.pedidosService.getPedidosCliente(this.cliente, this.pagina, this.tamanioPagina)
      .subscribe(
        data => {
          data['content'].forEach(p => this.pedidos.push(p));
          this.totalPaginas = data['totalPages'];
          this.isLoading = false;
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.isLoading = false;
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
}
