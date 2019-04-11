import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AvisoService} from '../../services/aviso.service';
import {UbicacionesService} from '../../services/ubicaciones.service';
import {finalize} from 'rxjs/operators';
import {Localidad} from '../../models/localidad';
import {Provincia} from '../../models/provincia';
import {Ubicacion} from '../../models/ubicacion';
import {Cliente} from '../../models/cliente';

@Component({
  selector: 'sic-com-ubicacion',
  templateUrl: 'ubicacion.component.html',
  styleUrls: ['ubicacion.component.scss']
})
export class UbicacionComponent implements OnInit, OnChanges {
  @Input() ubicacion: Ubicacion;
  @Input() inEdition = false;
  @Output() updated = new EventEmitter<Ubicacion>(true);
  @Output() editionStateChange = new EventEmitter<boolean>(true);

  ubicacionForm: FormGroup;

  provincias: Provincia[] = [];
  localidades: Localidad[] = [];

  isProvinciasLoading = false;
  isLocalidadesLoading = false;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private avisoService: AvisoService,
              private ubicacionesService: UbicacionesService) {}

  ngOnInit(): void {
    this.rebuildForm();
    this.isProvinciasLoading = true;
    if (this.ubicacionForm.get('idProvincia').enabled) {
      this.ubicacionForm.get('idProvincia').disable({ onlySelf: true, emitEvent: false });
    }
    this.ubicacionesService.getProvincias()
      .pipe(finalize(() => {
        this.isProvinciasLoading = false;
        this.ubicacionForm.get('idProvincia').enable({ onlySelf: true, emitEvent: false });
      }))
      .subscribe(
        (data: Provincia[]) => this.provincias = data,
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      )
    ;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ubicacion) {
      this.ubicacion = changes.ubicacion.currentValue;
      this.rebuildForm();
    }
    if (changes.inEdition) {
      this.inEdition = changes.inEdition.currentValue;
    }
  }

  toggleEdit() {
    this.inEdition = !this.inEdition;
    this.editionStateChange.emit(this.inEdition);
  }

  createForm() {
    this.ubicacionForm = this.fb.group({
      idProvincia: [null, Validators.required],
      idLocalidad: [null, Validators.required],
      calle: '',
      numero: '',
      piso: '',
      departamento: '',
      nombreLocalidad: '',
      nombreProvincia: '',
    });

    this.ubicacionForm.get('idProvincia').valueChanges
      .subscribe((value) => {
        this.localidades = [];
        if (!value) {
          this.ubicacionForm.get('nombreProvincia').setValue('');
          this.ubicacionForm.get('idLocalidad').setValue(null);
          this.ubicacionForm.get('idLocalidad').markAsTouched();
          this.ubicacionForm.get('nombreLocalidad').setValue('');
          return;
        }

        this.isLocalidadesLoading = true;
        if (this.ubicacionForm.get('idProvincia').enabled) {
          this.ubicacionForm.get('idProvincia').disable({ onlySelf: true, emitEvent: false });
        }
        this.ubicacionForm.get('idLocalidad').disable({ onlySelf: true, emitEvent: false });
        this.ubicacionesService.getLocalidades(value)
          .pipe(
            finalize(() => {
              this.isLocalidadesLoading = false;
              this.ubicacionForm.get('idProvincia').enable({ onlySelf: true, emitEvent: false });
              this.ubicacionForm.get('idLocalidad').enable({ onlySelf: true, emitEvent: false });
            })
          )
          .subscribe(
            (data: Localidad[]) => {
              const idLocalidad = this.ubicacionForm.get('idLocalidad').value;
              this.localidades = data;
              if (!this.inLocalidades(idLocalidad)) {
                this.ubicacionForm.get('idLocalidad').setValue(null);
                this.ubicacionForm.get('idLocalidad').markAsTouched();
              }
            },
            err => this.avisoService.openSnackBar(err.error, '', 3500)
          );
      });
  }

  rebuildForm() {
    if (!this.ubicacionForm) { this.createForm(); }
    if (!this.ubicacion) {
      this.ubicacionForm.reset();
    } else {
      this.ubicacionForm.reset({
        idProvincia: this.ubicacion.idProvincia,
        idLocalidad: this.ubicacion.idLocalidad,
        calle: this.ubicacion.calle,
        numero: this.ubicacion.numero,
        piso: this.ubicacion.piso,
        departamento: this.ubicacion.departamento,
        nombreLocalidad: this.ubicacion.nombreLocalidad,
        nombreProvincia: this.ubicacion.nombreProvincia,
      });
    }
  }

  getUbicacionLabel() {
    if (!this.ubicacion) { return ''; }
    const arr = [];
    arr.push(this.ubicacion.calle ? this.ubicacion.calle : '');
    arr.push(this.ubicacion.numero ? this.ubicacion.numero : '');
    arr.push(this.ubicacion.piso ? this.ubicacion.piso + ' Piso' : '');
    arr.push(this.ubicacion.departamento ? 'Dpto ' + this.ubicacion.departamento : '');
    arr.push(this.ubicacion.nombreLocalidad ? ' - ' + this.ubicacion.nombreLocalidad : ' - ');
    arr.push(this.ubicacion.nombreProvincia ? this.ubicacion.nombreProvincia : '');
    return arr.join(' ');
  }

/*
  indexOfProvincia(idProvincia) {
    for (let i = 0; i < this.provincias.length; i += 1) {
      if (this.provincias[i].idProvincia === idProvincia) {
        return i;
      }
    }

    return -1;
  }

  indexOfLocalidad(idLocalidad) {
    for (let i = 0; i < this.localidades.length; i += 1) {
      if (this.localidades[i].idLocalidad === idLocalidad) {
        return i;
      }
    }

    return -1;
  }
*/

  inLocalidades(idLocalidad) {
    for (const l of this.localidades) {
      if (l.idLocalidad === idLocalidad) { return true; }
    }
    return false;
  }

  getFormValues(): Ubicacion {
    return {
      calle: this.ubicacionForm.get('calle').value,
      codigoPostal: this.ubicacion ? this.ubicacion.codigoPostal : null,
      departamento: this.ubicacionForm.get('departamento').value,
      descripcion: this.ubicacion ? this.ubicacion.descripcion : null,
      idLocalidad: this.ubicacionForm.get('idLocalidad').value,
      idProvincia: this.ubicacionForm.get('idProvincia').value,
      idUbicacion: this.ubicacion ? this.ubicacion.idUbicacion : null,
      latitud: this.ubicacion ? this.ubicacion.latitud : null,
      longitud: this.ubicacion ? this.ubicacion.longitud : null,
      nombreLocalidad: '',
      nombreProvincia: '',
      numero: this.ubicacionForm.get('numero').value,
      piso: this.ubicacionForm.get('piso').value,
      eliminada: this.ubicacion ? this.ubicacion.eliminada : null,
    };
  }

  submit() {
    if (this.ubicacionForm.valid) {
      const ubicacion: Ubicacion = this.getFormValues();
      this.updated.emit(ubicacion);
    }
  }
}
