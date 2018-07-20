import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';

import {Cliente} from '../../models/cliente';
import {Pais} from '../../models/pais';

import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {PaisesService} from '../../services/paises.service';
import { Provincia } from '../../models/provincia';
import { ProvinciasService } from '../../services/provincias.service';

@Component({
  selector: 'sic-com-cliente',
  templateUrl: 'cliente.component.html',
  styleUrls: ['cliente.component.scss']
})
export class ClienteComponent implements OnInit {
    clienteForm: FormGroup;
    @Input() inEdition = false;
    private _cliente: Cliente = null;
    private paises: Array<Pais> = [];
    private provincias:  Array<Provincia> = [];

    constructor(
        private fb: FormBuilder, private avisoService: AvisoService,
        private paisesService: PaisesService,
        private provinciasService: ProvinciasService
    ) {
        this.createForm();
    }

    @Input()
    set cliente(cliente: Cliente|null) {
        this._cliente = cliente || null;
        if (this._cliente) {
            // this.clenteForm.setValue({});
            console.log(this._cliente);
        }
    }

    get cliente(): Cliente|null { return this._cliente; }

    createForm() {
        this.clienteForm = this.fb.group({
            idFiscal: '',
            razonSocial: ['', Validators.required],
            nombreFantasia: '',
            idCondicionIVA: [null, Validators.required],
            direccion: '',
            idPais: [null, Validators.required],
            idProvincia: [null, Validators.required],
            idLocalidad: [null, Validators.required],
            // username: ['', Validators.required ],
            // apellido: ['', Validators.required ],
            // nombre: ['', Validators.required ],
            // email: ['', [Validators.required, Validators.email]],
            // password: '',
            // repeatPassword: ''
        });
        // this.clenteForm.setValidators(PasswordValidation.MatchPassword);
    }

    ngOnInit() {
        this.getPaises();
    }

    toggleEdit() {
        this.inEdition = !this.inEdition;
        this.rebuildForm();
    }

    submit() {
        if (this.clienteForm.valid) {
            const cliente = this.getFormValues();
            // this.usuariosService.saveUsuario(cliente).subscribe(
            //     data => { this._cliente = cliente; this.toggleEdit(); },
            //     err => { this.avisoService.openSnackBar(err.error, '', 3500); }
            // );
        }
    }

    getFormValues(): Cliente {
        return null;
    }

    rebuildForm() {
        // this.clienteForm.reset({
        //     username: this._cliente.username,
        //     apellido: this._cliente.apellido,
        //     nombre: this._cliente.nombre,
        //     email: this._cliente.email,
        //     password: '',
        //     repeatPassword: '',
        // });
    }

    getPaises() {
        this.paisesService.getPaises().subscribe((data: [Pais]) => { this.paises = data; });
    }

    getProvincias(idPais) {
        this.provinciasService.getProvincias(idPais).subscribe((data: [Provincia]) => { this.provincias = data; });
    }
}
