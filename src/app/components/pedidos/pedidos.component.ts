import {Component, OnInit, Input} from '@angular/core';
import {Pedido} from '../../models/pedido';
import {Cliente} from '../../models/cliente';
import {PedidosService} from '../../services/pedidos.service';
import { AvisoService } from '../../services/aviso.service';

@Component({
    selector: 'sic-com-pedidos',
    templateUrl: 'pedidos.component.html',
    styleUrls: ['pedidos.component.scss']
})
export class PedidosComponent implements OnInit {
    @Input() cliente: Cliente = null;
    pedidos: Array<Pedido> = [];
    ultimo = true;
    pagina = 0;
    esUltimaPagina = false;
    loading = false;

    constructor(private pedidosService: PedidosService, private avisoService: AvisoService) {}

    ngOnInit() {
        this.loadMore();
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
            () => { this.loading = false; }
        );
    }
}
