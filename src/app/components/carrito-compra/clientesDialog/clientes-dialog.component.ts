import {Component, OnInit} from '@angular/core';
import {ClientesService} from '../../../services/clientes.service';
import {MatDialogRef} from '@angular/material';
import {AvisoService} from 'app/services/aviso.service';

@Component({
  selector: 'sic-com-clientes-dialog',
  templateUrl: './clientes-dialog.component.html',
  styleUrls: ['./clientes-dialog.component.scss']
})
export class ClientesDialogComponent implements OnInit {

  public cliente;
  public clientes = [];
  public loadingClientes = false;
  public pagina = 0;
  public tamanioPagina = 10;
  public totalPaginas = 0;
  public totalElementos = 0;

  constructor(private dialogRef: MatDialogRef<ClientesDialogComponent>, private avisoService: AvisoService,
              private clientesService: ClientesService) {}

  ngOnInit() {
    this.cliente = this.clientesService.getClienteSeleccionado();
  }

  getClientes(nombre, pagina, reset) {
    this.loadingClientes = true;
    this.pagina = pagina;
    if (reset) {
      this.clientes = [];
      this.pagina = 0;
    }
    this.clientesService.getClientes(nombre, this.pagina, this.tamanioPagina).subscribe(
      data => {
        data['content'].forEach(c => this.clientes.push(c));
        this.totalPaginas = data['totalPages'];
        this.totalElementos = data['totalElements'];
        this.loadingClientes = false;
      },
      err => {
        this.loadingClientes = false;
        this.avisoService.openSnackBar(err.error, '', 3500)
      });
  }

  seleccionarCliente(id_Cliente) {
    const cli = this.getClienteBusqueda(id_Cliente);
    this.clientesService.addClienteSeleccionado(cli);
    this.cliente = this.clientesService.getClienteSeleccionado();
    this.cerrarDialog();
  }

  getClienteBusqueda(id_Cliente) {
    const index = this.clientes.map(c => {
      return c['id_Cliente'];
    }).indexOf(id_Cliente);
    return this.clientes[index];
  }

  cerrarDialog() {
    this.dialogRef.close();
  }
}
