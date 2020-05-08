import {Component, OnInit, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Ubicacion} from '../../models/ubicacion';
import {Provincia} from '../../models/provincia';
import {Localidad} from '../../models/localidad';
import {UbicacionesService} from '../../services/ubicaciones.service';
import {AvisoService} from '../../services/aviso.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'sic-com-ubicacion-form',
  templateUrl: 'ubicacion-form.component.html',
  styleUrls: ['ubicacion-form.component.scss']
})
export class UbicacionFormComponent implements OnInit {
  @Output()
  formReady = new EventEmitter<FormGroup>(true);

  private ubicacion: Ubicacion;
  ubicacionForm: FormGroup;

  provincias: Provincia[] = [];
  localidades: Localidad[] = [];

  isProvinciasLoading = false;
  isLocalidadesLoading = false;

  constructor(private fb: FormBuilder,
              private ubicacionesService: UbicacionesService,
              private avisoService: AvisoService) {}

  ngOnInit() {
    this.createForm();
    this.isProvinciasLoading = true;
    this.ubicacionesService.getProvincias()
      .pipe(
        finalize(() => this.isProvinciasLoading = false)
      )
      .subscribe(
        (data: Provincia[]) => this.provincias = data,
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      )
    ;
  }

  createForm() {
    this.ubicacionForm = this.fb.group({
      idProvincia: [null, Validators.required],
      idLocalidad: [null, Validators.required],
      calle: '',
      numero: '',
      piso: '',
      departamento: '',
      descripcion: '',
      nombreLocalidad: '',
      nombreProvincia: '',
    });

    this.ubicacionForm.get('idProvincia').valueChanges
      .subscribe((value) => {
        if (!value) {
          this.ubicacionForm.get('nombreProvincia').setValue('');
          this.localidades = [];
          this.ubicacionForm.get('idLocalidad').setValue(null);
          this.ubicacionForm.get('idLocalidad').markAsTouched();
          this.ubicacionForm.get('nombreLocalidad').setValue('');
          return;
        }

        this.isLocalidadesLoading = true;
        this.ubicacionesService.getLocalidades(value)
          .pipe(
            finalize(() => {
              this.isLocalidadesLoading = false;
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

    this.formReady.emit(this.ubicacionForm);
  }

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

  inLocalidades(idLocalidad) {
    for (const l of this.localidades) {
      if (l.idLocalidad === idLocalidad) { return true; }
    }
    return false;
  }
}
