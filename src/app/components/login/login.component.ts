import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';

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
              private authService: AuthService, private avisoService: AvisoService) {}

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
}
