import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {Usuario} from '../../models/usuario';
import {UsuariosService} from '../../services/usuarios.service';
import {AvisoService} from '../../services/aviso.service';
import {PasswordValidation} from '../../validators/PasswordValidation';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'sic-com-usuario',
  templateUrl: 'usuario.component.html',
  styleUrls: ['usuario.component.scss']
})
export class UsuarioComponent implements OnInit {

    @Input()
    inEdition = false;

    usuarioForm: FormGroup;
    usuario: Usuario = null;

    constructor(private fb: FormBuilder, private usuariosService: UsuariosService,
                private avisoService: AvisoService, private authService: AuthService) {
        this.createForm();
    }

    ngOnInit() {
      this.authService.getLoggedInUsuario().subscribe(
        (usuario: Usuario) => {
          this.usuario = usuario || null;
          if (this.usuario) {
            this.usuarioForm.setValue({
              username: this.usuario.username || '' ,
              apellido: this.usuario.apellido || '',
              nombre: this.usuario.nombre || '',
              email: this.usuario.email || '',
              password: '',
              repeatPassword: '',
            });
          }
        });
    }

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

    toggleEdit() {
        this.inEdition = !this.inEdition;
        this.rebuildForm();
    }

    submit() {
        if (this.usuarioForm.valid) {
            const usuario = this.getFormValues();
            this.usuariosService.saveUsuario(usuario).subscribe(
                data => {
                  this.usuario = usuario;
                  this.authService.setNombreUsuarioLoggedIn(usuario.nombre + ' ' + usuario.apellido);
                  this.toggleEdit();
                },
                err => this.avisoService.openSnackBar(err.error, '', 3500)
            );
        }
    }

    getFormValues(): Usuario {
        return {
            id_Usuario: this.usuario.id_Usuario,
            idEmpresaPredeterminada: this.usuario.idEmpresaPredeterminada,
            username: this.usuarioForm.get('username').value,
            apellido: this.usuarioForm.get('apellido').value,
            nombre: this.usuarioForm.get('nombre').value,
            email: this.usuarioForm.get('email').value,
            password: this.usuarioForm.get('password').value,
            roles: this.usuario.roles,
            habilitado: this.usuario.habilitado
        };
    }

    rebuildForm() {
        this.usuarioForm.reset({
            username: this.usuario.username,
            apellido: this.usuario.apellido,
            nombre: this.usuario.nombre,
            email: this.usuario.email,
            password: '',
            repeatPassword: '',
        });
    }
}
