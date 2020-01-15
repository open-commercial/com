import { Component, OnInit } from '@angular/core';
import {Usuario} from '../../models/usuario';
import {AuthService} from '../../services/auth.service';
import {finalize} from 'rxjs/operators';
import {AvisoService} from '../../services/aviso.service';

@Component({
  selector: 'sic-com-compra-realizada',
  templateUrl: './compra-realizada.component.html',
  styleUrls: ['./compra-realizada.component.scss']
})
export class CompraRealizadaComponent implements OnInit {
  usuario: Usuario;
  loading = false;

  constructor(private authService: AuthService,
              private avisoService: AvisoService) { }

  ngOnInit() {
    this.loading = true;
    this.authService.getLoggedInUsuario()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        (usuario: Usuario) => this.usuario = usuario,
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.authService.logout();
        },
      )
    ;
  }
}
