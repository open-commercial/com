import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {Router} from '@angular/router';

@Component({
  selector: 'sic-com-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  returnUrl = '';
  loginForm: FormGroup;
  usuario: Usuario;

  constructor(private router: Router,
              private authService: AuthService,
              private avisoService: AvisoService,
              private fb: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['productos']);
    }
  }

  buildForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.model = this.loginForm.value;
      this.loading = true;
      this.loginForm.disable();
      this.authService.login(this.model.username, this.model.password).subscribe(
        () => {
          this.router.navigate(['productos']);
        },
        err => {
          this.loading = false;
          this.loginForm.enable();
          this.avisoService.openSnackBar(err, '', 3500);
        });
    }
  }
}
