import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange} from '@angular/core';
import {environment} from '../../../environments/environment';
import {DynamicScriptLoaderService} from '../../services/dynamic-script-loader.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Cliente} from '../../models/cliente';
import {AvisoService} from '../../services/aviso.service';
import {MPOpcionPago, MPPago} from '../../models/mercadopago/mp-pago';

@Component({
  selector: 'sic-com-mercado-pago',
  templateUrl: './mercado-pago.component.html',
  styleUrls: ['./mercado-pago.component.scss']
})
export class MercadoPagoComponent implements OnInit, OnChanges {

  @Input() c: Cliente;
  @Input() m: number;
  @Output() updated = new EventEmitter<MPPago>(true);

  cliente: Cliente = null;
  monto = 0;

  mp = null;
  mpForm: FormGroup;

  tiposDocumento = [];
  cuotas = [];

  paymentMethods = [];
  // tarjetas = [];
  pagosEfectivo = [];

  // Opciones de pago
  opcionesPago = [
    { value: MPOpcionPago.TARJETA_CREDITO, text: 'Tarjeta de Crédito' },
    { value: MPOpcionPago.TARJETA_DEBITO, text: 'Tarjeta de Débito' },
    { value: MPOpcionPago.EFECTIVO, text: 'Otras Opciones' },
  ];

  // enum MPOpcionPago para el template
  opcionPago = MPOpcionPago;

  pmSecureThumbnail = '';

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService,
              private fb: FormBuilder,
              private avisoService: AvisoService) { }

  ngOnInit() {
    this.dynamicScriptLoader.load('mercadopago').then(data => {
      this.mp = window['Mercadopago'];
      this.mp.setPublishableKey(environment.mercadoPagoPublicKey);
      this.mp.getIdentificationTypes((s, tdData) => {
        this.tiposDocumento = tdData;
      });
      this.mp.getAllPaymentMethods((s, d: [any]) => {
        this.paymentMethods = d.filter(function(v) { return v['status'] === 'active'; });
        /*this.tarjetas = this.paymentMethods.filter(function (v) {
          return ['credit_card', 'debit_card'].indexOf(v['payment_type_id']) >= 0;
        });*/
        this.pagosEfectivo = this.paymentMethods.filter(function (v) {
          return ['ticket', 'atm', 'bank_transfer', 'prepaid_card'].indexOf(v['payment_type_id']) >= 0;
        });
      });
    }).catch(err => this.avisoService.openSnackBar(err.error, ''));
    this.createForm();
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.c !== undefined) { this.cliente = changes.c.currentValue; }
    if (changes.m !== undefined) { this.monto = changes.m.currentValue; }
  }

  createForm() {
    this.mpForm = this.fb.group({
      opcionPago: ['', Validators.required],
      paymentMethod: ['', Validators.required],
    });

    this.mpForm.get('opcionPago').valueChanges.subscribe((value: MPOpcionPago) => {
      this.toggleControls(value);
    });

    this.mpForm.get('paymentMethod').valueChanges.subscribe(paymentoMethod => {
      if (paymentoMethod) {
        this.checkPaymentMethod();
        this.checkPaymentAmount();
        this.pmSecureThumbnail = paymentoMethod.secure_thumbnail;
      } else {
        this.pmSecureThumbnail = '';
      }
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
      this.mpForm.addControl('cardNumber', new FormControl('', [Validators.required]));
      this.mpForm.addControl('securityCode', new FormControl('', [Validators.required]));
      this.mpForm.addControl('cardExpirationMonth', new FormControl('', [Validators.required]));
      this.mpForm.addControl('cardExpirationYear', new FormControl('', [Validators.required]));
      this.mpForm.addControl('cardholderName', new FormControl('', [Validators.required]));
      this.mpForm.addControl('docType', new FormControl('', [Validators.required]));
      this.mpForm.addControl('docNumber', new FormControl('', [Validators.required]));

      if (value === MPOpcionPago.TARJETA_CREDITO) {
        this.mpForm.addControl('installments', new FormControl('', [Validators.required]));
        this.mpForm.addControl('installmentsPaymentMethod', new FormControl('', [Validators.required]));

        this.mpForm.get('installments').valueChanges.subscribe((v) => {
          this.checkInstallmentsPaymentAmount();
        });
      }

      this.mpForm.addControl('token', new FormControl(''));
    }

    this.mpForm.updateValueAndValidity();
  }

  guessingPaymentMethod($event) {
    if (!this.monto || this.monto < 1) { return; }
    const bin = $event.target.value;
    if (bin.length >= 6) {
      this.mp.getPaymentMethod({ 'bin': bin }, (status, response) => {
        if (status === 200) {
          const paymentMethod = response[0];
          console.log(paymentMethod);
          this.mpForm.get('paymentMethod').setValue(paymentMethod);
          if (paymentMethod.payment_type_id === 'credit_card') {
            this.mp.getInstallments({'bin': bin, 'amount': this.monto}, (s, data) => {
              console.log(data);
              this.mpForm.get('installmentsPaymentMethod').setValue(data[data.length - 1]);
              this.cuotas = data[data.length - 1].payer_costs.map(function (c) {
                const labels = c.labels.filter((l: string) => l.toUpperCase().startsWith('CFT')).join(', ');
                const mensaje = c.recommended_message  + (labels.length ? ' (' + labels + ')' : '');
                return {
                  cuotas: c.installments,
                  texto: mensaje,
                  min_allowed_amount: c.min_allowed_amount,
                  max_allowed_amount: c.max_allowed_amount,
                };
              });
            });
          }
        } else {
          this.clearValues();
          console.log(response);
          this.avisoService.openSnackBar('Error al obtener el método de pago: ' + response.message);
        }
      });
    } else {
      this.clearValues();
    }
  }

  clearValues() {
    this.mpForm.get('paymentMethod').setValue('');
    if (this.mpForm.get('installmentsPaymentMethod')) {
      this.mpForm.get('installmentsPaymentMethod').setValue('');
    }
    this.cuotas = [];
  }

  checkPaymentMethod() {
    const op: MPOpcionPago = this.mpForm.get('opcionPago').value;
    const pm = this.mpForm.get('paymentMethod').value;

    if (!op || !pm) { return; }

    if (
      (op === MPOpcionPago.TARJETA_CREDITO && pm.payment_type_id !== 'credit_card') ||
      (op === MPOpcionPago.TARJETA_DEBITO && pm.payment_type_id !== 'debit_card')
    ) {
      this.mpForm.get('cardNumber').setErrors({ 'invalid_type': true });
    }

    if (op === MPOpcionPago.EFECTIVO && ['ticket', 'atm', 'bank_transfer', 'prepaid_card'].indexOf(pm.payment_type_id) < 0) {
      this.mpForm.get('paymentMethod').setErrors({ 'invalid_type': true });
    }
  }

  checkPaymentAmount() {
    const op: MPOpcionPago = this.mpForm.get('opcionPago').value;
    if (op === MPOpcionPago.TARJETA_CREDITO) { return; }

    const pm = this.mpForm.get('paymentMethod').value;

    if (this.monto < pm.min_allowed_amount || this.monto > pm.max_allowed_amount) {
      this.mpForm.get('paymentMethod').setErrors({ 'amount_not_allowed': true });
    }
  }

  checkInstallmentsPaymentAmount() {
    const installments = this.mpForm.get('installments').value;

    if (this.monto < installments.min_allowed_amount || this.monto > installments.max_allowed_amount) {
      this.mpForm.get('paymentMethod').setErrors({ 'amount_not_allowed': true });
    }
  }

  submit($event) {
    if (this.mpForm.valid) {
      const data = this.mpForm.value;
      if (data.opcionPago === MPOpcionPago.TARJETA_CREDITO || data.opcionPago === MPOpcionPago.TARJETA_DEBITO) {
        const form = $event.target;
        this.mp.createToken(form, (status, response) => {
          if (status !== 200 && status !== 201) {
            alert('Por favor, verifique los datos ingresados.');
          } else {
            this.mpForm.get('token').setValue(response.id);
            const pago = this.getPago();
            console.log(pago);
          }
        });
      } else {
        const pago = this.getPago();
        console.log(pago);
      }
    }
  }

  getPago() {
    const data = this.mpForm.value;
    const pago: MPPago = {
      issuerId: null,
      paymentMethodId: data.paymentMethod.id,
      installments: data.opcionPago === MPOpcionPago.TARJETA_CREDITO ? data.installments : null,
      token: data.opcionPago === MPOpcionPago.TARJETA_CREDITO || data.opcionPago === MPOpcionPago.TARJETA_DEBITO ? data.token : null,
    };

    return pago;
  }
}
