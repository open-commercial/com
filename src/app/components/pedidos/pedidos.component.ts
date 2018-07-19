import {Component, OnInit} from '@angular/core';
import {Pedido} from '../../models/pedido';
import {Cliente} from '../../models/cliente';
import {PedidosService} from '../../services/pedidos.service';
import {AvisoService} from '../../services/aviso.service';
import {Usuario} from '../../models/usuario';
import {ClientesService} from '../../services/clientes.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'sic-com-pedidos',
  templateUrl: 'pedidos.component.html',
  styleUrls: ['pedidos.component.scss']
})
export class PedidosComponent implements OnInit {

  cliente: Cliente = null;
  pedidos: Array<Pedido> = [];
  pagina = 0;
  esUltimaPagina = false;
  loading = false;

  constructor(private pedidosService: PedidosService, private avisoService: AvisoService,
              private authService: AuthService, private clientesService: ClientesService) {}

  ngOnInit() {
      this.authService.getLoggedInUsuario().subscribe(
        (usuario: Usuario) => {
          this.clientesService.getClienteDelUsuario(usuario.id_Usuario).subscribe(
            (cliente: Cliente) => {
              if (cliente) {
                this.cliente = cliente;
                this.loadMore();
              }
            });
        }
      );
  }

  loadMore() {
    this.pagina += 1;
    this.loading = true;
    this.pedidosService.getPedidosCliente(this.cliente, this.pagina).subscribe(
      data => {
        this.pedidos = this.pedidos.concat(data['content']);
        this.esUltimaPagina = data['last'];
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
      },
      () => {
        this.loading = false;
      }
    );
  }
}
