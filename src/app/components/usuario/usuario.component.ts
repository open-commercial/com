import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormControl, Validators, FormGroup, FormGroupDirective, NgForm} from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { AvisoService } from '../../services/aviso.service';

@Component({
  selector: 'sic-com-usuario',
  templateUrl: 'usuario.component.html',
  styleUrls: ['usuario.component.scss']
})
export class UsuarioComponent implements OnInit {
    usuarioForm: FormGroup;
    @Input()
    readonly = true;
    private _usuario: Usuario = null;

    constructor(private fb: FormBuilder, private usuariosService: UsuariosService, private avisoService: AvisoService) {
        this.createForm();
    }

    createForm() {
        this.usuarioForm = this.fb.group({
            nombreUsuario: ['', Validators.required ],
            apellido: ['', Validators.required ],
            nombre: ['', Validators.required ],
            email: ['', [Validators.required, Validators.email]],
            contrasenia: '',
            repeticionContrasenia: '',
        });
    }
    ngOnInit() {
    }

    toggleEdit() {
        this.readonly = !this.readonly;
    }

    submit() {
        if (this.usuarioForm.valid) {
            this.assignFormValues();
            this.usuariosService.saveUsuario(this._usuario).subscribe(
                data => this.readonly = true,
                err => this.avisoService.openSnackBar(err.error, '', 3500)
            );
        }
    }

    assignFormValues() {
        this._usuario.username = this.usuarioForm.get('nombreUsuario').value;
        this._usuario.apellido = this.usuarioForm.get('apellido').value;
        this._usuario.nombre = this.usuarioForm.get('nombre').value;
        this._usuario.email = this.usuarioForm.get('email').value;
        // if (this.usuarioForm.get('contrasenia').value) {
            this._usuario.password = this.usuarioForm.get('contrasenia').value;
        // }
    }

    @Input()
    set usuario(usuario: Usuario|null) {
        this._usuario = usuario || null;
        // console.log(usuario);
        if (this._usuario) {
            console.log(usuario);
            this.usuarioForm.setValue({
                nombreUsuario: this._usuario.username || '' ,
                apellido: this._usuario.apellido || '',
                nombre: this._usuario.nombre || '',
                email: this._usuario.email || '',
                contrasenia: '',
                repeticionContrasenia: '',
            });
        }
    }

    get usuario(): Usuario|null { return this._usuario; }
}
