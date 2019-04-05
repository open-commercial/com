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
        cliente => this.cliente = cliente,
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );
  }

  getUbicaciones() {
    this.ubicacionFacturacion = null;
    this.ubicacionEnvio = null;
    if (this.cliente) {
      if (!this.isLoading) { this.isLoading = true; }
      forkJoin(
        this.ubicacionesService.getUbicacion(this.cliente.idUbicacionFacturacion),
        this.ubicacionesService.getUbicacion(this.cliente.idUbicacionEnvio),
      )
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(
          (data: Ubicacion[]) => {
            this.ubicacionFacturacion = data[0];
            this.ubicacionEnvio = data[1];
          }
        );
    }
  }
}
