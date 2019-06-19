import { Component, OnInit, Input } from "@angular/core";
import { EstudiantesService } from "../estudiante.service";
import { Subscription } from "rxjs";
import { Provincia } from "../provincias.model";
import { FormGroup, NgForm } from "@angular/forms";
import { Estudiante } from "../estudiante.model";
import { FormsModule } from "@angular/forms";
import { Nacionalidad } from "../nacionalidades.model";
import { Localidad } from "../localidades.model";

@Component({
  selector: "app-mostrar-estudiantes",
  templateUrl: "./mostrar-estudiantes.component.html",
  styleUrls: ["./mostrar-estudiantes.component.css"]
})
export class MostrarEstudiantesComponent implements OnInit {
  nacionalidades: Nacionalidad[] = [];
  provincias: Provincia[] = [];
  localidades: Localidad[] = [];
  localidadesFiltradas: Localidad[] = [];
  suscripcion: Subscription;
  estudiante: Estudiante;
  maxDate = new Date();
  primeraVez = true;

  //Atributos Estudiantes del HTML
  apellidoEstudiante: string;
  nombreEstudiante: string;
  tipoDocEstudiante: string;
  nroDocEstudiante: number;
  cuilEstudiante: number;
  sexoEstudiante: string;
  calleEstudiante: string;
  nroCalleEstudiante: number;
  pisoEstudiante: string;
  departamentoEstudiante: string;
  provinciaEstudiante: string;
  localidadEstudiante: string;
  CPEstudiante: number;
  fechaNacEstudiante: string;
  nacionalidadEstudiante: string;
  estadoCivilEstudiante: string;
  telefonoEstudiante: number;

  constructor(public servicio: EstudiantesService) {
    this.apellidoEstudiante = this.servicio.estudianteSeleccionado.apellido;
    this.nombreEstudiante = this.servicio.estudianteSeleccionado.nombre;
    this.tipoDocEstudiante = this.servicio.estudianteSeleccionado.tipoDocumento;
    this.nroDocEstudiante = this.servicio.estudianteSeleccionado.numeroDocumento;
    this.cuilEstudiante = this.servicio.estudianteSeleccionado.cuil;
    this.sexoEstudiante = this.servicio.estudianteSeleccionado.sexo;
    this.calleEstudiante = this.servicio.estudianteSeleccionado.calle;
    this.nroCalleEstudiante = this.servicio.estudianteSeleccionado.numeroCalle;
    this.pisoEstudiante = this.servicio.estudianteSeleccionado.piso;
    this.departamentoEstudiante = this.servicio.estudianteSeleccionado.departamento;
    this.provinciaEstudiante = this.servicio.estudianteSeleccionado.provincia;
    this.localidadEstudiante = this.servicio.estudianteSeleccionado.localidad;
    this.CPEstudiante = this.servicio.estudianteSeleccionado.codigoPostal;
    this.fechaNacEstudiante = this.servicio.estudianteSeleccionado.fechaNacimiento;
    this.nacionalidadEstudiante = this.servicio.estudianteSeleccionado.nacionalidad;
    this.estadoCivilEstudiante = this.servicio.estudianteSeleccionado.estadoCivil;
    this.telefonoEstudiante = this.servicio.estudianteSeleccionado.telefonoFijo;
  }

  ngOnInit() {
    this.servicio.getProvincias();
    this.suscripcion = this.servicio
      .getProvinciasListener()
      .subscribe(provinciasActualizadas => {
        this.provincias = provinciasActualizadas;
      });
    this.servicio.getLocalidades();
    this.suscripcion = this.servicio
      .getLocalidadesListener()
      .subscribe(localidadesActualizadas => {
        this.localidades = localidadesActualizadas;
        const idProvinciaEstudiante = this.localidades.find(
          localidad => localidad.nombre === this.localidadEstudiante
        ).id_provincia;
        this.FiltrarLocalidades(idProvinciaEstudiante);
      });
    this.servicio.getNacionalidades();
    this.suscripcion = this.servicio
      .getNacionalidadesListener()
      .subscribe(nacionalidadesActualizadas => {
        this.nacionalidades = nacionalidadesActualizadas;
      });
  }

  FiltrarLocalidades(idProvincia: number) {
    this.localidadesFiltradas = [...this.localidades];
    this.localidadesFiltradas = this.localidadesFiltradas.filter(
      localidad => localidad.id_provincia === idProvincia
    );
    this.primeraVez = false;
  }

  // Cuando se destruye el componente se eliminan las suscripciones.
  ngOnDestroy() {
    this.suscripcion.unsubscribe();
  }

  onEditar(form: NgForm) {}

  onGuardar() {
    this.servicio.modificarEstudiante(
      this.apellidoEstudiante,
      this.nombreEstudiante,
      this.tipoDocEstudiante,
      this.nroDocEstudiante,
      this.cuilEstudiante,
      this.sexoEstudiante,
      this.calleEstudiante,
      this.nroCalleEstudiante,
      this.pisoEstudiante,
      this.departamentoEstudiante,
      this.provinciaEstudiante,
      this.localidadEstudiante,
      this.CPEstudiante,
      this.fechaNacEstudiante,
      this.nacionalidadEstudiante,
      this.estadoCivilEstudiante,
      this.telefonoEstudiante,
      "adultoResponsable"
    );
    //TERMINAR
  }
}
