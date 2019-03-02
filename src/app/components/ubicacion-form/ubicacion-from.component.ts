import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
      // nombreLocalidad: [{value: '', disabled: true}],
      buscador: '',
      nombreLocalidad: ['', Validators.required],
      nombreProvincia: '',
      codigoPostal: ['', Validators.required],
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      piso: '',
      departamento: '',
    });

    this.formReady.emit(this.ubicacionForm);

    this.ubicacionForm.get('nombreLocalidad').valueChanges
      .subscribe((value) => {
        this.ubicacionForm.get('buscador').setValue(this.getLocalidadFullName());
        this.ubicacionForm.get('buscador').markAsTouched();
      });
    this.ubicacionForm.get('nombreLocalidad').statusChanges
      .subscribe((value) => {
        if (value === 'INVALID') {
          this.ubicacionForm.get('buscador').setErrors({'invalid': true});
        } else {
          this.ubicacionForm.get('buscador').setErrors(null);
        }
        this.ubicacionForm.get('buscador').markAsTouched();
      });

    this.ubicacionForm.get('buscador').setValue(this.getLocalidadFullName());
  }

  handleAddressChange($event) {
    const lastNombreLocalidad = this.ubicacionForm.get('nombreLocalidad').value;
    const nombreLocalidad = $event.name;
    if (lastNombreLocalidad !== nombreLocalidad) {
      this.ubicacionForm.get('nombreLocalidad').setValue(nombreLocalidad);
    }

    const lastNombreProvincia = this.ubicacionForm.get('nombreProvincia').value;
    const nombreProvincia = this.getNombreProvincia($event);
    if (nombreProvincia !== lastNombreProvincia) {
      this.ubicacionForm.get('nombreProvincia').setValue(nombreProvincia);
    }
  }

  getLocalidadFullName() {
    return this.ubicacionForm.get('nombreLocalidad').value
      ? (this.ubicacionForm.get('nombreLocalidad').value + ', ' + this.ubicacionForm.get('nombreProvincia').value + ', Argentina')
      : '';
  }

  getNombreProvincia(data) {
    const found = data.address_components.filter((value) => value.types.indexOf('administrative_area_level_1') > -1);
    return found.length ? found[0].short_name : '';
  }
}
