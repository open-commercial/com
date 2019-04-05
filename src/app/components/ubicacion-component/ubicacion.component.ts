import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AvisoService} from '../../services/aviso.service';
import {UbicacionesService} from '../../services/ubicaciones.service';
import {finalize} from 'rxjs/operators';
import {Localidad} from '../../models/localidad';
import {Provincia} from '../../models/provincia';
import {Ubicacion} from '../../models/ubicacion';

@Component({
  selector: 'sic-com-ubicacion',
  templateUrl: 'ubicacion.component.html',
  styleUrls: ['ubicacion.component.scss']
})
export class UbicacionComponent implements OnInit, OnChanges {
  @Input() ubicacion: Ubicacion;

  ubicacionForm: FormGroup;

  provincias: Provincia[] = [];
  localidades: Localidad[] = [];

  isProvinciasLoading = false;
  isLocalidadesLoading = false;

  inEdition = false;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private avisoService: AvisoService,
              private ubicacionesService: UbicacionesService) {}

  ngOnInit(): void {
    this.createForm();
    this.isProvinciasLoading = true;
    this.ubicacionesService.getProvincias()
      .pipe(finalize(() => this.isProvinciasLoading = false))
      .subscribe(
        (data: Provincia[]) => this.provincias = data,
        err => this.avisoService.openSnackBar(err.error, '', 3500)
      )
    ;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ubicacion) {
      this.ubicacion = changes.ubicacion.currentValue;
    }
  }

  toggleEdit() {
    this.inEdition = !this.inEdition;
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
  }

  rebuildForm() {
    if (!this.ubicacion) {
      this.ubicacionForm.reset();
    } else {
      /*this.clienteForm.reset({
        idFiscal: this.cliente.idFiscal,
        nombreFiscal: this.cliente.nombreFiscal,
        nombreFantasia: this.cliente.nombreFantasia,
        categoriaIVA: this.cliente.categoriaIVA,
        telefono: this.cliente.telefono,
        contacto: this.cliente.contacto,
        email: this.cliente.email,
      });*/
    }
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

  submit() {
    if (this.ubicacionForm.valid) {
      console.log('valid');
    }
  }
}
