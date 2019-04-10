import {Component, OnInit} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {AuthService} from '../../services/auth.service';
import {Ubicacion} from '../../models/ubicacion';
import {forkJoin} from 'rxjs';
import {UbicacionesService} from '../../services/ubicaciones.service';

@Component({
  selector: 'sic-com-cliente-ubicaciones',
  templateUrl: 'cliente-ubicaciones.component.html',
  styleUrls: ['cliente-ubicaciones.component.scss']
})
export class ClienteUbicacionesComponent implements OnInit {

  isLoading = false;
  ufUpdating = false;
  ufInEdition = false;

  ueUpdating = false;
  ueInEdition = false;

  cliente: Cliente;
  ubicacionFacturacion: Ubicacion;
  ubicacionEnvio: Ubicacion;

  constructor(private authService: AuthService,
              private clientesService: ClientesService,
              private avisoService: AvisoService,
              private ubicacionesService: UbicacionesService) {}

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

    this.ubicacionFacturacion = null;
    this.ubicacionEnvio = null;

    if (this.cliente) {
      const ufObs = this.cliente.idUbicacionFacturacion ? this.ubicacionesService.getUbicacion(this.cliente.idUbicacionFacturacion) : null;
      const ueObs = this.cliente.idUbicacionEnvio ? this.ubicacionesService.getUbicacion(this.cliente.idUbicacionEnvio) : null;

      if (ufObs && ueObs) {
        if (!this.isLoading) { this.isLoading = true; }
        forkJoin(ufObs, ueObs)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(
            (data: Ubicacion[]) => {
              this.ubicacionFacturacion = data[0];
              this.ubicacionEnvio = data[1];
            }
          );
      } else if (ufObs || ueObs) {
        if (!this.isLoading) { this.isLoading = true; }

        if (ufObs) {
          ufObs
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(
              u => this.ubicacionFacturacion = u,
              err => this.avisoService.openSnackBar(err.error, '', 3500)
            )
          ;
        }

        if (ueObs) {
          ueObs
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(
              u => this.ubicacionEnvio = u,
              err => this.avisoService.openSnackBar(err.error, '', 3500)
            )
          ;
        }
      }
    }
  }

  ubicacionFacturacionUpdated(ubicacion: Ubicacion) {
    this.ufUpdating = true;
    if (ubicacion.idUbicacion) {
      this.ubicacionesService.updateUbicacion(ubicacion)
        .subscribe(
          () => {
            this.ubicacionesService.getUbicacion(this.ubicacionFacturacion.idUbicacion)
              .pipe(finalize(() => this.ufUpdating = false))
              .subscribe(u => {
                this.ubicacionFacturacion = u;
                this.ufInEdition = false;
              });
          },
          err => {
            this.ufUpdating = false;
            this.avisoService.openSnackBar(err.error, '', 3500);
          }
        )
      ;
    } else {
      this.ubicacionesService.createUbicacionFacturacionCliente(this.cliente, ubicacion)
        .pipe(finalize(() => this.ufUpdating = false))
        .subscribe(u => {
          this.ubicacionFacturacion = u;
          this.ufInEdition = false;
        })
      ;
    }
  }

  ubicacionEnvioUpdated(ubicacion: Ubicacion) {
    this.ueUpdating = true;
    if (ubicacion.idUbicacion) {
      this.ubicacionesService.updateUbicacion(ubicacion)
        .subscribe(
          () => {
            this.ubicacionesService.getUbicacion(this.ubicacionEnvio.idUbicacion)
              .pipe(finalize(() => this.ueUpdating = false))
              .subscribe(u => {
                this.ubicacionEnvio = u;
                this.ueInEdition = false;
              });
          },
          err => {
            this.ueUpdating = false;
            this.avisoService.openSnackBar(err.error, '', 3500);
          }
        )
      ;
    } else {
      this.ubicacionesService.createUbicacionEnvioCliente(this.cliente, ubicacion)
        .pipe(finalize(() => this.ueUpdating = false))
        .subscribe(u => {
          this.ubicacionEnvio = u;
          this.ueInEdition = false;
        })
      ;
    }
  }
}
