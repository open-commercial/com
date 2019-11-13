import {Component, OnInit} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {Ubicacion} from '../../models/ubicacion';

@Component({
  selector: 'sic-com-cliente-ubicaciones',
  templateUrl: 'cliente-ubicaciones.component.html',
  styleUrls: ['cliente-ubicaciones.component.scss']
})
export class ClienteUbicacionesComponent implements OnInit {

  isLoading = false;
  ubicacionFacturacionUpdating = false;
  ubicacionFacturacionInEdition = false;

  ubicacionEnvioUpdating = false;
  ubicacionEnvioInEdition = false;

  cliente: Cliente;
  ubicacionFacturacion: Ubicacion;
  ubicacionEnvio: Ubicacion;

  constructor(private authService: AuthService,
              private clientesService: ClientesService,
              private avisoService: AvisoService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        cliente => this.assignCliente(cliente),
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );
  }

  assignCliente(cliente: Cliente) {
    this.cliente = cliente;
    this.ubicacionFacturacion = this.cliente.ubicacionFacturacion;
    this.ubicacionEnvio = this.cliente.ubicacionEnvio;
  }

  ubicacionFacturacionUpdated(ubicacion: Ubicacion) {
    this.ubicacionFacturacionUpdating = true;
    this.cliente.ubicacionFacturacion = ubicacion;
    this.clientesService.saveCliente(this.cliente)
      .subscribe(
        () => {
          this.clientesService.getCliente(this.cliente.idCliente)
            .pipe(finalize(() => this.ubicacionFacturacionUpdating = false))
            .subscribe(
              (c: Cliente) => {
                this.ubicacionFacturacion = c.ubicacionFacturacion;
                this.ubicacionFacturacionInEdition = false;
              });
        },
        err => {
          this.ubicacionFacturacionUpdating = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }

  ubicacionEnvioUpdated(ubicacion: Ubicacion) {
    this.ubicacionEnvioUpdating = true;

    this.cliente.ubicacionEnvio = ubicacion;
    this.clientesService.saveCliente(this.cliente)
      .subscribe(
        () => {
          this.clientesService.getCliente(this.cliente.idCliente)
            .pipe(finalize(() => this.ubicacionEnvioUpdating = false))
            .subscribe((c: Cliente) => {
              this.ubicacionEnvio = c.ubicacionEnvio;
              this.ubicacionEnvioInEdition = false;
            });
        },
        err => {
          this.ubicacionEnvioUpdating = false;
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }
}
