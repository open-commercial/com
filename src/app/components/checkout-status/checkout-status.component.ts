import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { AvisoService } from '../../services/aviso.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'sic-com-checkout-status',
  templateUrl: './checkout-status.component.html',
  styleUrls: ['./checkout-status.component.scss']
})
export class CheckoutStatusComponent implements OnInit {
  status = '';
  statusOptions = ['aprobado', 'pendiente'];
  usuario: Usuario;
  loading = false;

  constructor(private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly avisoService: AvisoService) { }

  ngOnInit() {
    const status = this.route.snapshot.paramMap.get('status');
    if (this.statusOptions.indexOf(status) < 0) {
      this.router.navigate(['']);
    }

    this.status = status;

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
