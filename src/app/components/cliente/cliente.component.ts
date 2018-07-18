import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';

import {Cliente} from '../../models/cliente';
import {Pais} from '../../models/pais';

import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {PaisesService} from '../../services/paises.service';

// import {Usuario} from '../../models/usuario';
// import {UsuariosService} from '../../services/usuarios.service';

// import {PasswordValidation} from '../../validators/PasswordValidation';

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

    constructor(
        private fb: FormBuilder, private avisoService: AvisoService,
        private paisesService: PaisesService
    ) {
        this.createForm();
    }

    @Input()
    set cliente(cliente: Cliente|null) {
        this._cliente = cliente || null;
        if (this._cliente) {
            // this.clenteForm.setValue({});
        }
    }

    get cliente(): Cliente|null { return this._cliente; }

    createForm() {
        this.clienteForm = this.fb.group({
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
        this.paisesService.getPaises().subscribe((data: [Pais]) => { this.paises = data; console.log(data); });
    }
}
