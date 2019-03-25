import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Ubicacion} from '../../models/ubicacion';
import {Provincia} from '../../models/provincia';
import {Localidad} from '../../models/localidad';
import {UbicacionService} from '../../services/ubicacion.service';
import {AvisoService} from '../../services/aviso.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'sic-com-ubicacion-form',
  templateUrl: 'ubicacion-from.component.html',
  styleUrls: ['ubicacion-from.component.scss']
})
export class UbicacionFromComponent implements OnInit {
  @Output()
  formReady = new EventEmitter<FormGroup>(true);

  private ubicacion: Ubicacion;
  ubicacionForm: FormGroup;

  provincias: Provincia[] = [];
  localidades: Localidad[] = [];

  isProvinciasLoading = false;
  isLocalidadesLoading = false;

  constructor(private fb: FormBuilder,
              private ubicacionService: UbicacionService,
              private avisoService: AvisoService) {}

  ngOnInit() {
    this.createForm();
    this.isProvinciasLoading = true;
    this.ubicacionService.getProvincias()
      .pipe(
        finalize(() => {
          this.isProvinciasLoading = false;
        })
      )
      .subscribe(
        (data: Provincia[]) => {
          this.provincias = data;
          setTimeout(() => {
            if (!this.ubicacionForm.get('idProvincia').value) {
               if (this.provincias.length) { this.ubicacionForm.get('idProvincia').setValue(this.provincias[0].idProvincia); }
            }
          }, 1000);
        },
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      );
  }

  createForm() {
    this.ubicacionForm = this.fb.group({
      idProvincia: [null, Validators.required],
      idLocalidad: [null, Validators.required],
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      piso: '',
      departamento: '',
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
        this.ubicacionService.getLocalidades(value)
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
                this.ubicacionForm.get('idLocalidad').setValue(this.localidades.length ? this.localidades[0].idLocalidad : null);
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
