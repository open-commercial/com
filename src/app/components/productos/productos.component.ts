import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductosService} from '../../services/productos.service';
import {RubrosService} from '../../services/rubros.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';
import {AvisoService} from 'app/services/aviso.service';

@Component({
  selector: 'sic-com-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit, OnDestroy {

  productos = [];
  loadingProducts = false;
  totalPaginas = 0;
  pagina = 0;
  tamanioPagina = 10;
  busquedaCriteria = '';
  rubros;
  nombreRubroSeleccionado;
  buscarProductosSubscription: Subscription;

  constructor(private productosService: ProductosService, private rubrosService: RubrosService,
              private route: ActivatedRoute, private avisoService: AvisoService) {}

  ngOnInit() {
    this.busquedaCriteria = this.route.snapshot.paramMap.get('busqueda') || '';
    this.cargarRubros();
    this.buscarProductosSubscription = this.productosService.buscarProductos$.subscribe(data => {
      this.busquedaCriteria = data;
      this.cargarProductos(true);
    });
    this.productosService.buscarProductos(this.busquedaCriteria);
  }

  ngOnDestroy() {
    this.buscarProductosSubscription.unsubscribe();
  }

  cargarRubros() {
    this.rubrosService.getRubros().subscribe(
      data => {
        this.rubros = data;
        this.nombreRubroSeleccionado = this.rubrosService.nombreRubroSeleccionado;
      },
      err => this.avisoService.openSnackBar(err.error, '', 3500)
    );
  }

  filtrarPorRubro(nombreRubro) {
    if (nombreRubro) {
      this.rubros.map(r => {
        if (r['nombre'] === nombreRubro) {
          this.rubrosService.idRubroSeleccionado = r['id_Rubro'];
        }
      });
    } else {
      this.rubrosService.idRubroSeleccionado = null;
    }
    this.rubrosService.nombreRubroSeleccionado = nombreRubro;
    this.cargarProductos(true);
  }

  cargarProductos(reset: boolean) {
    if (reset) {
      this.productos = [];
      this.pagina = 0;
    }
    this.loadingProducts = true;
    this.productosService.getProductos(this.busquedaCriteria, this.rubrosService.idRubroSeleccionado,
      this.pagina, this.tamanioPagina).subscribe(
        data => {
          data['content'].forEach(p => this.productos.push(p));
          this.totalPaginas = data['totalPages'];
          this.loadingProducts = false;
        },
        err => {
          err => this.avisoService.openSnackBar(err.error, '', 3500)
          this.loadingProducts = false;
        });
  }

  masProductos() {
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarProductos(false);
    }
  }
}
