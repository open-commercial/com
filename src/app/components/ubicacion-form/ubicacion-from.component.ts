import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LatLng, MapsAPILoader} from '@agm/core';
import {Ubicacion} from '../../models/ubicacion';

@Component({
  selector: 'sic-com-ubicacion-form',
  templateUrl: 'ubicacion-from.component.html',
  styleUrls: ['ubicacion-from.component.scss']
})
export class UbicacionFromComponent implements OnInit {
  @Output()
  formReady = new EventEmitter<FormGroup>();

  private _ubicacion: Ubicacion;
  ubicacionForm: FormGroup;

  // Google Maps
  isMapApiLoaded = false;
  acOptions = {
    types: ['(cities)'],
    componentRestrictions: { country: 'AR' }
  };

  constructor(private fb: FormBuilder,
              private mapsApiLoader: MapsAPILoader) {
  }

  ngOnInit() {
    this.mapsApiLoader.load().then(() => this.isMapApiLoaded = true);
    this.createForm();
  }

  createForm() {
    this.ubicacionForm = this.fb.group({
      nombreLocalidad: '',
      nombreProvincia: '',
      codigoPostal: '',
      calle: '',
      numero: '',
      piso: '',
      departamento: '',
    });
    this.formReady.emit(this.ubicacionForm);
  }

  handleAddressChange($event) {
    console.log($event);
  }
}
