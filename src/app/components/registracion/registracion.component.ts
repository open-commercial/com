import { Component, OnDestroy, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AvisoService} from '../../services/aviso.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {RegistracionService} from '../../services/registracion.service';
import {Router} from '@angular/router';
import {CategoriaIVA} from '../../models/categoria-iva';
import {RegistracionCuenta} from '../../models/registracion-cuenta';
import {nombreFiscalValidator} from '../../validators/cliente-nombre-fiscal.validator';
import {finalize} from 'rxjs/operators';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sic-com-registracion',
  templateUrl: './registracion.component.html',
  styleUrls: ['./registracion.component.scss']
})
export class RegistracionComponent implements OnInit, OnDestroy {
  loading = false;
  usuario: Usuario;
  registracionForm: FormGroup;
  keys = Object.keys;
  categoriasIVA = CategoriaIVA;

  private captchaV3subscription: Subscription;

  constructor(private authService: AuthService,
              private router: Router,
              private registracionService: RegistracionService,
              private avisoService: AvisoService,
              private fb: FormBuilder,
              private recaptchaV3Service: ReCaptchaV3Service) {
    this.createForm();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
    }
  }

  ngOnDestroy() {
    if (this.captchaV3subscription) {
      this.captchaV3subscription.unsubscribe();
    }
  }

  createForm() {
    this.registracionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(250), Validators.pattern('^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$')]],
      apellido: ['', [Validators.required, Validators.maxLength(250), Validators.pattern('^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$')]],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      email: ['', [Validators.required, Validators.email]],
      categoriaIVA: ['CONSUMIDOR_FINAL', Validators.required],
      nombreFiscal: '',
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(250)]],
    });
    this.registracionForm.setValidators(nombreFiscalValidator);
  }

  registrar() {
    if (this.registracionForm.valid) {
      this.captchaV3subscription = this.recaptchaV3Service.execute('Registración')
        .subscribe(
          (token) => {
            console.log(token);
            const reg: RegistracionCuenta = this.registracionForm.value;
            if (reg.categoriaIVA === <CategoriaIVA>'CONSUMIDOR_FINAL') {
              reg.nombreFiscal = '';
            }
            this.loading = true;
            this.registracionForm.disable();
            this.registracionService.registrar(reg)
              .pipe(
                finalize(() => {
                  this.loading = false;
                  this.registracionForm.enable();
                })
              )
              .subscribe(
                () => {
                  this.router.navigate(['registracion-realizada'], { state: { reg: reg }});
                },
                err => {
                  this.avisoService.openSnackBar(err.error, '', 3500);
                }
              );
          },
          (error) => {
            this.avisoService.openSnackBar(error, 'Ok');
          },
        );
    }
  }
}
