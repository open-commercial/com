import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {UsuariosService} from '../../services/usuarios.service';
import {AvisoService} from '../../services/aviso.service';
import {PasswordValidation} from '../../validators/PasswordValidation';

@Component({
  selector: 'sic-com-usuario',
  templateUrl: 'usuario.component.html',
  styleUrls: ['usuario.component.scss']
})
export class UsuarioComponent implements OnInit {
    usuarioForm: FormGroup;
    @Input() inEdition = false;
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

    ngOnInit() {}

    toggleEdit() {
        this.inEdition = !this.inEdition;
        this.rebuildForm();
    }

    submit() {
        if (this.usuarioForm.valid) {
            const usuario = this.getFormValues();
            this.usuariosService.saveUsuario(usuario).subscribe(
                data => { this._usuario = usuario; this.toggleEdit(); },
                err => { this.avisoService.openSnackBar(err.error, '', 3500); }
            );
        }
    }

    getFormValues(): Usuario {
        return {
            id_Usuario: this._usuario.id_Usuario,
            idEmpresaPredeterminada: this._usuario.idEmpresaPredeterminada,
            username: this.usuarioForm.get('username').value,
            apellido: this.usuarioForm.get('apellido').value,
            nombre: this.usuarioForm.get('nombre').value,
            email: this.usuarioForm.get('email').value,
            password: this.usuarioForm.get('password').value,
            roles: this._usuario.roles,
            habilitado: this._usuario.habilitado
        };
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
