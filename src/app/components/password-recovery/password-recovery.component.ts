import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';

@Component({
  selector: 'sic-com-password-reset',
  templateUrl: './password-recovery.component.html'
})
export class PasswordRecoveryComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl = '';

  constructor(private router: Router, private route: ActivatedRoute,
              private authService: AuthService, private avisoService: AvisoService) {
  }

  ngOnInit() {
    const key = this.route.snapshot.queryParams.key;
    const id = this.route.snapshot.queryParams.id;
    if (!key || !id) {
      this.router.navigate(['login']);
    }
    this.authService.cambiarContrasenia(key, id).subscribe(
      (token: string) => {
        this.authService.setAuthenticationInfo(token);
        this.avisoService.openSnackBar('Debe cambiar su contraseña en la sección "Mi Usuario"', '', 5000);
        this.router.navigate(['perfil']);
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.router.navigate(['login']);
      }
    );
  }
}
