import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormControl, Validators, FormGroup, FormGroupDirective, NgForm, ValidatorFn, ValidationErrors} from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { AvisoService } from '../../services/aviso.service';
import { PasswordValidation } from '../../validators/PasswordValidation';

@Component({
  selector: 'sic-com-usuario',
  templateUrl: 'usuario.component.html',
  styleUrls: ['usuario.component.scss']
})
export class UsuarioComponent implements OnInit {
    usuarioForm: FormGroup;
    @Input()
    readonly = true;
    inEdition = false;
    private _usuario: Usuario = null;

    constructor(private fb: FormBuilder, private usuariosService: UsuariosService, private avisoService: AvisoService) {
        this.createForm();
    }

    @Input()
    set usuario(usuario: Usuario|null) {
        this._usuario = usuario || null;
        if (this._usuario) {
            this.usuarioForm.setValue({
                username: this._usuario.username || '' ,
                apellido: this._usuario.apellido || '',
                nombre: this._usuario.nombre || '',
                email: this._usuario.email || '',
                password: '',
                repeatPassword: '',
            });
        }
    }

    get usuario(): Usuario|null { return this._usuario; }

    createForm() {
        this.usuarioForm = this.fb.group({
            username: ['', Validators.required ],
            apellido: ['', Validators.required ],
            nombre: ['', Validators.required ],
            email: ['', [Validators.required, Validators.email]],
            password: '',
            repeatPassword: ''
        });
        this.usuarioForm.setValidators(PasswordValidation.MatchPassword);
    }

    ngOnInit() {
    }

    toggleEdit() {
        this.inEdition = !this.inEdition;
    }

    submit() {
        if (this.usuarioForm.valid) {
            this.assignFormValues();
            this.usuariosService.saveUsuario(this._usuario).subscribe(
                data => this.updateInterface(),
                err => this.avisoService.openSnackBar(err.error, '', 3500)
            );
        }
    }

    assignFormValues() {
        this._usuario.username = this.usuarioForm.get('username').value;
        this._usuario.apellido = this.usuarioForm.get('apellido').value;
        this._usuario.nombre = this.usuarioForm.get('nombre').value;
        this._usuario.email = this.usuarioForm.get('email').value;
        this._usuario.password = this.usuarioForm.get('password').value;
    }

    updateInterface() {
        this.rebuildForm();
        this.toggleEdit();
    }

    rebuildForm() {
        this.usuarioForm.reset({
            username: this._usuario.username,
            apellido: this._usuario.apellido,
            nombre: this._usuario.nombre,
            email: this._usuario.email,
            password: '',
            repeatPassword: '',
        });
    }
}
