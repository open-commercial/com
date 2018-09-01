import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {MatDialog} from '@angular/material';
import {EmailDialogComponent} from './emailDialog/email-dialog.component';

@Component({
  selector: 'sic-com-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl = '';

  constructor(private router: Router, private route: ActivatedRoute,
              private dialog: MatDialog, private authService: AuthService, private avisoService: AvisoService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(
      params => {
        this.returnUrl = params['return'] || '/productos';
        if (this.authService.isAuthenticated()) {
          this.router.navigateByUrl(this.returnUrl);
        }
      });
  }

  login() {
    this.loading = true;
    this.authService.login(this.model.username, this.model.password).subscribe(
        data => {
          this.loading = false;
          this.router.navigateByUrl(this.returnUrl);
        },
        err => {
          this.loading = false;
          this.avisoService.openSnackBar(err, '', 3500);
        });
  }

  openDialogEmail() {
    const dialogRef = this.dialog.open(EmailDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.avisoService.openSnackBar('Los datos de recupero fueron enviados a su correo electrónico', '', 3500);
      }
    });
  }
}
