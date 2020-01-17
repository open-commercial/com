import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import {RegistracionCuenta} from '../../models/registracion-cuenta';

@Component({
  selector: 'sic-com-registracion-realizada',
  templateUrl: './registracion-realizada.component.html',
  styleUrls: ['./registracion-realizada.component.scss']
})
export class RegistracionRealizadaComponent implements OnInit {

  registracion: RegistracionCuenta;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap
      .pipe(map(() => window.history.state))
      .subscribe(data => this.registracion = data.reg || null);
  }

}
