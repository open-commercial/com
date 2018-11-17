import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {RegistracionService} from '../../services/registracion.service';
import {Router} from '@angular/router';
import {CategoriaIVA} from '../../models/categoria-iva';
import {RegistracionCuenta} from '../../models/registracion-cuenta';
import {nombreFiscalValidator} from '../../validators/cliente-nombre-fiscal.validator';
import {ReCaptcha2Component} from 'ngx-captcha';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'sic-com-registracion',
  templateUrl: './registracion.component.html',
  styleUrls: ['./registracion.component.scss']
})
export class RegistracionComponent implements OnInit {
  loading = false;
  usuario: Usuario;
  siteKey = '6Lfwp3QUAAAAANbMv6EJApDs1FS9l7v6LMig4nGU';
  registracionForm: FormGroup;
  keys = Object.keys;
  categoriasIVA = CategoriaIVA;

  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;

  constructor(private authService: AuthService,
              private router: Router,
              private registracionService: RegistracionService,
              private avisoService: AvisoService,
              private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['productos']);
    }
  }

  createForm() {
    this.registracionForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      categoriaIVA: ['CONSUMIDOR_FINAL', Validators.required],
      nombreFiscal: '',
      password: ['', Validators.required],
      recaptcha: ['', Validators.required],
    });
    this.registracionForm.setValidators(nombreFiscalValidator);
  }

  registrar() {
    if (this.registracionForm.valid) {
      const reg: RegistracionCuenta = this.registracionForm.value;
      if (reg.categoriaIVA === <CategoriaIVA>'CONSUMIDOR_FINAL') {
        reg.nombreFiscal = '';
      }
      this.loading = true;
      this.registracionForm.disable();
      this.registracionService.registrar(reg)
        .pipe(
          finalize(() => {
            this.captchaElem.reloadCaptcha();
            this.registracionForm.get('recaptcha').setValue('');
            this.loading = false;
            this.registracionForm.enable();
          })
        )
        .subscribe(
          () => {
            this.avisoService.openSnackBar('Recibirá un email para confirmar su registración', '', 3500);
            this.router.navigate(['productos']);
          },
          err => {
            this.avisoService.openSnackBar(err.error, '', 3500);
          }
        );
    }
  }
}
