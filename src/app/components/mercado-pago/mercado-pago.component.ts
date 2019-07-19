import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange} from '@angular/core';
import {environment} from '../../../environments/environment';
import {DynamicScriptLoaderService} from '../../services/dynamic-script-loader.service';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Cliente} from '../../models/cliente';
import {AvisoService} from '../../services/aviso.service';
import {MPOpcionPago, MPPago} from '../../models/mercadopago/mp-pago';
import {errorsInfo} from '../../models/mercadopago/errors';
import {PagosService} from '../../services/pagos.service';
import {debounceTime, finalize} from 'rxjs/operators';
import {formatNumber} from '@angular/common';

@Component({
  selector: 'sic-com-mercado-pago',
  templateUrl: './mercado-pago.component.html',
  styleUrls: ['./mercado-pago.component.scss']
})
export class MercadoPagoComponent implements OnInit, OnChanges {

  @Input() cliente: Cliente = null;
  @Input() monto = 1;
  @Input() showMontoControl = false;
  @Output() updated  = new EventEmitter<boolean>(true);
  @Output() canceled = new EventEmitter<void>(true);

  loading = false;
  mp = null;
  mpForm: FormGroup;
  cuotas = [];
  paymentMethods = [];
  pagosEfectivo = [];
  opcionesPago = [
    { value: MPOpcionPago.TARJETA_CREDITO, text: 'Tarjeta de Crédito' },
    { value: MPOpcionPago.TARJETA_DEBITO, text: 'Tarjeta de Débito' },
    { value: MPOpcionPago.EFECTIVO, text: 'Efectivo' },
  ];
  opcionPago = MPOpcionPago;
  pmSecureThumbnail = '';
  pago: MPPago = null;
  cft = '';
  tea = '';
  mpErrors = [];
  amountNotAllowedErrorMsg = '';
  meses = Array(12).fill(null).map((x, i) => i + 1 );
  anios = Array(12).fill(null).map((x, i) => i + 2019);

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService,
              private fb: FormBuilder,
              private pagosService: PagosService,
              private avisoService: AvisoService) {
    this.createForm();
  }

  ngOnInit() {
    this.dynamicScriptLoader.load('mercadopago').then(data => {
      this.mp = window['Mercadopago'];
      this.mp.setPublishableKey(environment.mercadoPagoPublicKey);
      this.mp.getAllPaymentMethods((s, d: [any]) => {
        this.paymentMethods = d.filter(function(v) { return v['status'] === 'active'; });
        this.pagosEfectivo = this.paymentMethods.filter(function (v) {
          return ['ticket', 'atm', 'bank_transfer', 'prepaid_card'].indexOf(v['payment_type_id']) >= 0 &&
            ['bapropagos', 'redlink'].indexOf(v['id']) < 0;
        });
      });
    }).catch(err => this.avisoService.openSnackBar(err.error, 'OK', 0));
    this.mpForm.get('opcionPago').setValue(MPOpcionPago.TARJETA_CREDITO);
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.cliente !== undefined) { this.cliente = changes.cliente.currentValue; }
    if (changes.monto !== undefined) { this.monto = changes.monto.currentValue; }

    if (changes.showMontoControl !== undefined) {
      if (!this.mpForm) { return; }

      const value = changes.showMontoControl.currentValue;
      if (!this.mpForm.get('monto')) {
        this.mpForm.addControl('monto', new FormControl('', [Validators.required, Validators.min(1)]));
        this.mpForm.get('monto').setValue(this.monto);
      }
      if (value === true) {
        this.mpForm.get('monto').enable();
        this.mpForm.get('monto').valueChanges.subscribe(m => {
          this.cft = ''; this.tea = '';
          this.monto = m;
          if (this.mpForm.get('installments')) {
            const bin = this.mpForm.get('cardNumber').value;
            this.getInstallments(bin);
          }
          this.checkPaymentAmount();
        });
      } else {
        this.mpForm.get('monto').disable();
      }
    }
  }

  createForm() {
    this.mpForm = this.fb.group({
      opcionPago: ['', Validators.required],
      paymentMethod: ['', Validators.required],
    });

    this.mpForm.get('opcionPago').valueChanges.subscribe((value: MPOpcionPago) => {
      this.toggleControls(value);
    });

    this.mpForm.get('paymentMethod').valueChanges.subscribe(pm => {
      if (pm) {
        this.checkPaymentMethod();
        this.pmSecureThumbnail = pm.secure_thumbnail;
      } else {
        this.pmSecureThumbnail = '';
      }
      this.checkPaymentAmount();
    });
  }

  toggleControls(value: MPOpcionPago) {
    this.clearValues();
    this.mpForm.removeControl('cardNumber');
    this.mpForm.removeControl('securityCode');
    this.mpForm.removeControl('cardExpirationMonth');
    this.mpForm.removeControl('cardExpirationYear');
    this.mpForm.removeControl('cardholderName');
    this.mpForm.removeControl('docType');
    this.mpForm.removeControl('docNumber');
    this.mpForm.removeControl('installments');
    this.mpForm.removeControl('installmentsPaymentMethod');
    this.mpForm.removeControl('token');

    if (value === MPOpcionPago.TARJETA_CREDITO || value === MPOpcionPago.TARJETA_DEBITO) {
      this.mpForm.addControl('cardNumber', new FormControl('', [
        Validators.required, Validators.min(0), Validators.pattern('[0-9]{14}[0-9]?[0-9]?[0-9]?[0-9]?')
      ]));

      this.mpForm.get('cardNumber').valueChanges
        .pipe(debounceTime(700))
        .subscribe(v => this.guessingPaymentMethod(v));

      this.mpForm.addControl('securityCode', new FormControl('', [
        Validators.required, Validators.min(0), Validators.pattern('[0-9]{3}')
      ]));
      this.mpForm.addControl('cardExpirationMonth', new FormControl('', [Validators.required]));
      this.mpForm.addControl('cardExpirationYear', new FormControl('', [Validators.required]));
      this.mpForm.addControl('cardholderName', new FormControl('', [Validators.required]));
      this.mpForm.addControl('docType', new FormControl('DNI', [Validators.required]));
      this.mpForm.addControl('docNumber', new FormControl('', [
        Validators.required, Validators.pattern('[1-9][0-9]{6}[0-9]?')
      ]));

      this.mpForm.addControl('installments', new FormControl('', [Validators.required]));
      this.mpForm.addControl('installmentsPaymentMethod', new FormControl('', [Validators.required]));

      this.mpForm.get('installments').valueChanges.subscribe((v) => {
        if (v) {
          this.cft = v.cft;
          this.tea = v.tea;
        } else {
          this.cft = '';
          this.tea = '';
        }
      });

      this.mpForm.get('installmentsPaymentMethod').valueChanges.subscribe(pm => {
        if (pm) {
          this.pmSecureThumbnail = pm.issuer.secure_thumbnail;
        } else {
          this.pmSecureThumbnail = '';
        }
      });

      this.mpForm.addControl('token', new FormControl(''));
    }

    if (value === MPOpcionPago.EFECTIVO) {
      if (this.pagosEfectivo.length) {
        this.mpForm.get('paymentMethod').setValue(this.pagosEfectivo[0]);
      }
    }
    this.mpForm.updateValueAndValidity();
  }

  guessingPaymentMethod(bin) {
    this.removeError(this.mpForm.get('cardNumber'), 'invalid_card_number');
    if (this.mpForm.get('installments')) {
      this.mpForm.get('installments').setValue(null);
    }
    if (!this.monto || this.monto < 1) { return; }
    if (String(bin).length >= 6) {
      this.mp.getPaymentMethod({ 'bin': bin }, (status, response) => {
        if (status === 200) {
          const paymentMethod = response[0];
          this.mpForm.get('paymentMethod').setValue(paymentMethod);
          this.getInstallments(bin);
        } else {
          this.addError(this.mpForm.get('cardNumber'), 'invalid_card_number');
          this.clearValues();
        }
      });
    } else {
      this.clearValues();
    }
  }

  getInstallments(bin) {
    if (String(bin).length < 6) { return; }
    if (this.monto <= 0) { this.cuotas = []; }
    const paymentMethod = this.mpForm.get('paymentMethod').value;
    if (this.mpForm.get('installmentsPaymentMethod')) {
      this.mp.getInstallments({'bin': bin, 'amount': this.monto}, (s, data) => {
        if (!data.length) {
          this.cuotas = [];
          this.mpForm.get('installmentsPaymentMethod').setValue(null);
          return;
        }
        this.mpForm.get('installmentsPaymentMethod').setValue(data[data.length - 1]);
        this.cuotas = data[data.length - 1].payer_costs.map(function (c) {
          const labelsArray = c.labels.filter((l: string) => l.toUpperCase().startsWith('CFT'));
          const aux = labelsArray[0].split('|');
          const mensaje = c.recommended_message;
          return {
            cuotas: c.installments,
            texto: mensaje,
            min_allowed_amount: c.min_allowed_amount,
            max_allowed_amount: c.max_allowed_amount,
            cft: aux[0].replace('CFT_', ''),
            tea: aux[1].replace('TEA_', '')
          };
        });

        if (this.cuotas.length && paymentMethod.payment_type_id === 'debit_card') {
          this.mpForm.get('installments').setValue(this.cuotas[0]);
        }
      });
    }
  }

  clearValues() {
    this.pago = null;
    this.mpForm.get('paymentMethod').setValue('');
    if (this.mpForm.get('installments')) {
      this.mpForm.get('installments').setValue('');
      this.mpForm.get('installmentsPaymentMethod').setValue('');
    }
    this.cuotas = [];
    this.cft = '';
    this.tea = '';
  }

  addError(ctrl: AbstractControl, key: string) {
    if (ctrl) {
      const errors = ctrl.errors || {};
      errors[key] = true;
      ctrl.setErrors(errors);
      this.mpForm.updateValueAndValidity();
    }
  }

  removeError(ctrl: AbstractControl, key: string) {
    if (ctrl && ctrl.errors && ctrl.errors[key] !== undefined) {
      // delete ctrl.errors[key];
      ctrl.setErrors(null);
      this.mpForm.updateValueAndValidity();
    }
  }

  checkPaymentMethod() {
    this.removeError(this.mpForm.get('cardNumber'), 'invalid_type');
    this.removeError(this.mpForm.get('paymentMethod'), 'invalid_type');

    const op: MPOpcionPago = this.mpForm.get('opcionPago').value;
    const pm = this.mpForm.get('paymentMethod').value;

    if (!op || !pm) { return; }

    if (
      (op === MPOpcionPago.TARJETA_CREDITO && pm.payment_type_id !== 'credit_card') ||
      (op === MPOpcionPago.TARJETA_DEBITO && pm.payment_type_id !== 'debit_card')
    ) {
      this.addError(this.mpForm.get('cardNumber'), 'invalid_type');
    }

    if (op === MPOpcionPago.EFECTIVO && ['ticket', 'atm', 'bank_transfer', 'prepaid_card'].indexOf(pm.payment_type_id) < 0) {
      this.addError(this.mpForm.get('paymentMethod'), 'invalid_type');
    }
  }

  checkPaymentAmount() {
    this.removeError(this.mpForm.get('monto'), 'amount_not_allowed');
    const op: MPOpcionPago = this.mpForm.get('opcionPago').value;
    const monto = this.mpForm.get('monto').value;

    if (!op || !monto) { return; }
    let pm = this.mpForm.get('paymentMethod').value;

    if (op === MPOpcionPago.TARJETA_CREDITO && this.mpForm.get('installments') && this.mpForm.get('installments').value) {
      pm = this.mpForm.get('installments').value;
    }

    const min = pm.min_allowed_amount < 1 ? 1 : pm.min_allowed_amount;

    if (monto < min || monto > pm.max_allowed_amount) {
      this.addError(this.mpForm.get('monto'), 'amount_not_allowed');
      this.amountNotAllowedErrorMsg = `Min $${this.formatearNumero(min)}, Max: $${this.formatearNumero(pm.max_allowed_amount)}`;
    } else {
      this.amountNotAllowedErrorMsg = '';
    }
  }

  submit($event) {
    if (!this.mpForm.valid) { return; }
    this.checkPaymentAmount();
    this.showCardsErrorMessages();
    if (this.mpForm.valid) {
      const data = this.mpForm.value;
      if (data.opcionPago === MPOpcionPago.TARJETA_CREDITO || data.opcionPago === MPOpcionPago.TARJETA_DEBITO) {
        const form = $event.target;
        this.mp.createToken(form, (status, response) => {
          if (status !== 200 && status !== 201) {
            this.showErrorMessages(response);
            return;
          } else {
            this.mpForm.get('token').setValue(response.id);
            this.generarPago();
          }
        });
      } else {
        this.generarPago();
      }
    }
  }

  generarPago() {
    const data = this.mpForm.value;

    const pago = {
      issuerId: data.installmentsPaymentMethod ? data.installmentsPaymentMethod.issuer.id : null,
      paymentMethodId: data.installmentsPaymentMethod ? data.installmentsPaymentMethod.payment_method_id : data.paymentMethod.id,
      installments: data.opcionPago === MPOpcionPago.TARJETA_CREDITO || data.opcionPago === MPOpcionPago.TARJETA_CREDITO
        ? data.installments.cuotas : null,
      token: data.opcionPago === MPOpcionPago.TARJETA_CREDITO || data.opcionPago === MPOpcionPago.TARJETA_DEBITO ? data.token : null,
      idCliente: this.cliente.id_Cliente,
      monto: this.monto,
    };

    this.loading = true;
    this.pagosService.generarMPPago(pago)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        v => {
          this.mp.clearSession();
          this.updated.emit(true);
          if (data.opcionPago === MPOpcionPago.EFECTIVO) {
            this.avisoService.openSnackBar('Recibirá un mail con los datos para realizar el deposito', 'OK', 0);
          }
        },
        err => {
          this.avisoService.openSnackBar(err.error, 'OK', 0);
        }
      )
    ;
  }

  cancel() {
    this.canceled.emit();
  }

  showErrorMessages(errors) {
    this.clearMPErrors();
    if (errors.cause.length) {
      const fieldErrors = [];
      for (const e of errors.cause) {
        const ei = errorsInfo[e.code] || null;
        if (ei && ei['field']) { fieldErrors.push(ei); }
      }

      if (fieldErrors.length) {
        for (const ei of fieldErrors) {
          const ctrl = this.mpForm.get(ei.field);
          this.addError(ctrl, 'mp_error');
          this.mpErrors[ei.field] = ei.message;
        }
        return;
      }

      const nonFieldErrors = [];
      for (const e of errors.cause) {
        const ei = errorsInfo[e.code] || null;
        if (ei && !ei['field']) { nonFieldErrors.push(ei); }
      }
      if (nonFieldErrors.length) {
        this.avisoService.openSnackBar(nonFieldErrors[0]['message'], 'OK', 0);
      }
    }
  }

  clearMPErrors() {
    this.removeError(this.mpForm.get('cardNumber'), 'mp_error');
    this.removeError(this.mpForm.get('securityCode'), 'mp_error');
    this.removeError(this.mpForm.get('cardExpirationMonth'), 'mp_error');
    this.removeError(this.mpForm.get('cardExpirationYear'), 'mp_error');
    this.removeError(this.mpForm.get('cardholderName'), 'mp_error');
    this.removeError(this.mpForm.get('docType'), 'mp_error');
    this.removeError(this.mpForm.get('docNumber'), 'mp_error');
    this.removeError(this.mpForm.get('installments'), 'mp_error');
    this.removeError(this.mpForm.get('installmentsPaymentMethod'), 'mp_error');
    this.removeError(this.mpForm.get('token'), 'mp_error');

    this.mpErrors['cardNumber'] = '';
    this.mpErrors['securityCode'] = '';
    this.mpErrors['cardExpirationMonth'] = '';
    this.mpErrors['cardExpirationYear'] = '';
    this.mpErrors['cardholderName'] = '';
    this.mpErrors['docType'] = '';
    this.mpErrors['docNumber'] = '';
    this.mpErrors['installments'] = '';
    this.mpErrors['installmentsPaymentMethod'] = '';
    this.mpErrors['token'] = '';
  }

  showCardsErrorMessages() {
    const op: MPOpcionPago = this.mpForm.get('opcionPago').value;
    if (op !== MPOpcionPago.TARJETA_CREDITO && op !== MPOpcionPago.TARJETA_DEBITO) {
      return;
    }

    this.clearMPErrors();
    const pm = this.mpForm.get('paymentMethod').value;
    const cardNumber = this.mpForm.get('cardNumber').value;
    const securityCode = this.mpForm.get('securityCode').value;

    if (!pm) {
      this.addError(this.mpForm.get('cardNumber'), 'mp_error');
      this.mpErrors['cardNumber'] = 'Error: Revise el nro de tarjeta ingresado';
      return;
    }

    if (!pm && !cardNumber || !securityCode) { return; }

    if (['credit_card', 'debit_card'].indexOf(pm.payment_type_id) < 0) { return; }

    const settings = pm['settings'];
    if (settings && settings.length) {
      /* Obtengo el setting con el cual corresponde */
      const fs = settings.filter((s) => {
        const binPattern = s['bin']['pattern'];
        return binPattern && (new RegExp(binPattern)).test(cardNumber); /* test si el número de tarjeta coincide con el patrón del bin. */
      });

      const setting = fs.length ? fs[0] : null;

      if (setting) {
        const binInstallmentsPattern = setting['bin']['installments_pattern'];
        /* test si el número de tarjeta coincide con el patrón de cuotas. */
        if (binInstallmentsPattern && !(new RegExp(binInstallmentsPattern)).test(cardNumber)) {
          // No se adminten cuotas
        }

        const binExclusionPattern = setting['bin']['exclusion_pattern'];
        /* test si el número de tarjeta no coincide con el patrón de exclusión. */
        if (binExclusionPattern && (new RegExp(binExclusionPattern)).test(cardNumber)) {
          // esta excluido el numero de tarjeta.
        }

        const cardNumberLength = setting['card_number']['length'];

        if (cardNumberLength && String(cardNumber).length !== cardNumberLength) {
          this.addError(this.mpForm.get('cardNumber'), 'mp_error');
          this.mpErrors['cardNumber'] = `Debe tener ${cardNumberLength} dígitos`;
        }

        const securityCodeLength = setting['security_code']['length'];

        if (securityCodeLength && String(securityCode).length !== securityCodeLength) {
          this.addError(this.mpForm.get('securityCode'), 'mp_error');
          this.mpErrors['securityCode'] = `Debe tener ${securityCodeLength} dígitos`;
        }
      }
    }
  }

  formatearNumero(n: number) {
    return formatNumber(n, 'es_AR').replace('.', '');
  }
}

