import {Component, OnInit, Input} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {CuentasCorrienteService} from '../../services/cuentas-corriente.service';
import {RenglonCuentaCorriente} from '../../models/renglon-cuenta-corriente';

@Component({
  selector: 'sic-com-cuenta-corriente',
  templateUrl: 'cuenta-corriente.component.html',
  styleUrls: ['cuenta-corriente.component.scss']
})
export class CuentaCorrienteComponent implements OnInit {

  private cliente: Cliente = null;
  private isLoading = true;
  private cuentaCorriente = null;
  private renglones = [];
  private pagina = 0;
  private totalPaginas = 0;
  private tamanioPagina = 5;

  constructor(private authService: AuthService,
              private avisoService: AvisoService,
              private clientesService: ClientesService,
              private cuentasCorrienteService: CuentasCorrienteService) {}

  ngOnInit() {
    this.isLoading = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        (cliente: Cliente) => {
          if (cliente) {
            this.cliente = cliente;
            this.cuentasCorrienteService.getCuentaCorriente(this.cliente)
              .subscribe(
                cc  => {
                  this.cuentaCorriente = cc;
                  this.cargarRenglones(true);
                },
                err => this.avisoService.openSnackBar(err.error, '', 3500)
              );
          }
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );
  }

  cargarRenglones(reset: boolean) {
    if (reset) {
      this.renglones = [];
      this.pagina = 0;
    }
    this.isLoading = true;
    this.cuentasCorrienteService.getCuentaCorrienteRenglones(this.cuentaCorriente, this.pagina, this.tamanioPagina).subscribe(
      data => {
        console.log(data);
        data['content'].forEach(r => this.renglones.push(r));
        this.totalPaginas = data['totalPages'];
        this.isLoading = false;
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.isLoading = false;
      }
    );
  }

  masRenglones() {
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarRenglones(false);
    }
  }

  getMovimiento(renglon: RenglonCuentaCorriente): string {
    const tc = renglon.tipoComprobante;

    if (tc.startsWith('FACTURA_') || tc.startsWith('PRESUPUESTO')) {
      return 'COMPRA';
    }

    if (tc.startsWith('RECIBO')) {
      return 'PAGO';
    }

    if (tc.startsWith('NOTA_CREDITO_')) {
      return 'NOTA DE CRÉDITO';
    }

    if (tc.startsWith('NOTA_DEBITO_')) {
      return 'NOTA DE DÉBITO';
    }

    return '';
  }
}
