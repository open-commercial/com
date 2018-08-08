import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {map, startWith, finalize} from 'rxjs/operators';
import {Usuario} from '../../models/usuario';
import {AuthService} from '../../services/auth.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {CondicionIVA} from '../../models/condicionIVA';
import {CondicionesIVAService} from '../../services/condicionesIVA.service';
import {Pais} from '../../models/pais';
import {PaisesService} from '../../services/paises.service';
import {Provincia} from '../../models/provincia';
import {ProvinciasService} from '../../services/provincias.service';
import {Localidad} from '../../models/localidad';
import {LocalidadesService} from '../../services/localidades.service';

@Component({
  selector: 'sic-com-cliente',
  templateUrl: 'cliente.component.html',
  styleUrls: ['cliente.component.scss']
})
export class ClienteComponent implements OnInit, OnDestroy {
    clienteForm: FormGroup;
    @Input() inEdition = false;
    private usuario: Usuario = null;
    private cliente: Cliente = null;

    private condicionesIVASubscription: Subscription;
    private paisesSubscription: Subscription;
    private provinciasSubscription: Subscription;
    private localidadesSubscription: Subscription;

    private condicionesIVA: Array<CondicionIVA> = [];
    private paises: Array<Pais> = [];
    private provincias:  Array<Provincia> = [];
    private localidades:  Array<Localidad> = [];

    private isLoading = true;

    constructor(
        private authService: AuthService,
        private fb: FormBuilder, private avisoService: AvisoService,
        private clientesService: ClientesService,
        private condicionesIVAService: CondicionesIVAService,
        private paisesService: PaisesService,
        private provinciasService: ProvinciasService,
        private localidadesService: LocalidadesService
    ) {
        this.createForm();
    }

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
            telPrimario: '',
            email: ['', Validators.email],
        });
    }

    ngOnInit() {
        this.isLoading = true;
        this.authService.getLoggedInUsuario()
            .subscribe(
                (usuario: Usuario) => {
                    this.usuario = usuario;
                    this.clientesService.getClienteDelUsuario(usuario.id_Usuario)
                        .pipe(
                            finalize(()  => this.isLoading = false)
                        )
                        .subscribe(
                            (cliente: Cliente) => {
                                if (cliente) {
                                    this.cliente = cliente;
                                }
                            }
                        );
                },
                err => { this.avisoService.openSnackBar(err.error, '', 3500); }
            );

        this.getCondicionesIVA();
        this.getPaises();
        this.clienteForm.get('idPais').valueChanges.subscribe(
            idPais => {
                this.getProvincias(idPais);
                // vacía el array de localidades. Esto también podria ser this.localidades = []
                this.localidades.splice(0, this.localidades.length);
            }
        );
        this.clienteForm.get('idProvincia').valueChanges.subscribe(
            idProvincia => this.getLocalidades(idProvincia)
        );
    }

    toggleEdit() {
        this.inEdition = !this.inEdition;
        this.rebuildForm();
    }

    submit() {
        if (this.clienteForm.valid) {
            const cliente = this.getFormValues();
            this.isLoading = true;
            this.clientesService.saveCliente(cliente)
                .pipe(
                    finalize(()  => this.isLoading = false)
                )
                .subscribe(
                    data => {
                        this.clientesService.getClienteDelUsuario(this.usuario.id_Usuario).subscribe(
                            (newcliente: Cliente) => {
                                if (cliente) {
                                    this.cliente = newcliente;
                                    this.inEdition = false;
                                }
                            });
                    },
                    err => { this.avisoService.openSnackBar(err.error, '', 3500); }
                );
        }
    }

    getFormValues(): any {
        return {
            id_Cliente: this.cliente ? this.cliente.id_Cliente : null,
            razonSocial: this.clienteForm.get('razonSocial').value,
            nombreFantasia: this.clienteForm.get('nombreFantasia').value,
            direccion: this.clienteForm.get('direccion').value,
            idFiscal: this.clienteForm.get('idFiscal').value,
            email: this.clienteForm.get('email').value,
            telPrimario: this.clienteForm.get('telPrimario').value,
            telSecundario: this.cliente ? this.cliente.telSecundario : '',
            contacto: this.cliente ? this.cliente.contacto : '',
            idLocalidad: this.clienteForm.get('idLocalidad').value,
            idCondicionIVA: this.clienteForm.get('idCondicionIVA').value,
            idCredencial: this.usuario.id_Usuario,
            idViajante: this.cliente ? this.cliente.idViajante : null,
        };
    }

    rebuildForm() {
        if (!this.cliente) {
            this.clienteForm.reset();
        } else {
            this.clienteForm.reset({
                idFiscal: this.cliente.idFiscal,
                razonSocial: this.cliente.razonSocial,
                nombreFantasia: this.cliente.nombreFantasia,
                idCondicionIVA: this.cliente.idCondicionIVA,
                direccion: this.cliente.direccion,
                idPais: this.cliente.idPais,
                idProvincia: this.cliente.idProvincia,
                idLocalidad: this.cliente.idLocalidad,
                telPrimario: this.cliente.telPrimario,
                telSecundario: this.cliente.telSecundario,
                contacto: this.cliente.contacto,
                email: this.cliente.email
            });
        }
    }

    getCondicionesIVA() {
        this.condicionesIVASubscription = this.condicionesIVAService.getCondicionesIVA()
            .subscribe((data: [CondicionIVA]) => this.condicionesIVA = data);
    }

    getPaises() {
        this.paisesSubscription = this.paisesService.getPaises()
            .subscribe((data: Pais[]) => { this.paises = data; });
    }

    getProvincias(idPais: number) {
        if (!idPais) {
            this.provincias.splice(0, this.provincias.length);
            this.localidades.splice(0, this.localidades.length);
            return;
        }
        this.provinciasSubscription = this.provinciasService.getProvincias(idPais)
            .subscribe((data: Provincia[]) => { this.provincias = data; });
    }

    getLocalidades(idProvincia: number) {
        if (!idProvincia) {
            this.localidades.splice(0, this.localidades.length);
            return;
        }
        this.localidadesSubscription = this.localidadesService.getLocalidades(idProvincia)
            .subscribe((data: Localidad[]) => this.localidades = data);
    }

    ngOnDestroy() {
        if (this.condicionesIVASubscription instanceof Subscription)  {
            this.condicionesIVASubscription.unsubscribe();
        }

        if (this.paisesSubscription instanceof Subscription)  {
            this.paisesSubscription.unsubscribe();
        }

        if (this.provinciasSubscription instanceof Subscription)  {
            this.provinciasSubscription.unsubscribe();
        }

        if (this.localidadesSubscription instanceof Subscription)  {
            this.localidadesSubscription.unsubscribe();
        }
    }
}
