import { CicloLectivoService } from "./../../cicloLectivo.service";
import { NgForm } from "@angular/forms";
import { CalificacionesService } from "../calificaciones.service";
import { MatSnackBar } from "@angular/material";
import { AutenticacionService } from "../../login/autenticacionService.service";
import { EstudiantesService } from "src/app/estudiantes/estudiante.service";
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { MediaMatcher } from "@angular/cdk/layout";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-calificaciones-examenes",
  templateUrl: "./calificaciones-examenes.component.html",
  styleUrls: ["./calificaciones-examenes.component.css"],
})
export class CalificacionesExamenesComponent implements OnInit, OnDestroy {
  apellidoEstudiante: string;
  nombreEstudiante: string;
  _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;
  fechaActual: Date;
  fechaDentroDeRangoExamen: boolean = false;
  materiasDesaprobadas: any[] = [];
  idMateriaSeleccionada: string = null;
  idCursoMateria: string;
  notaExamen: any;
  condicionExamen: string;
  private unsubscribe: Subject<void> = new Subject();
  aniosCiclos;

  constructor(
    public estudianteService: EstudiantesService,
    public servicioCicloLectivo: CicloLectivoService,
    public servicioCalificaciones: CalificacionesService,
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
    public authService: AutenticacionService,
    public snackBar: MatSnackBar,
    public cicloLectivoService: CicloLectivoService
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 800px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit() {
    this.fechaActual = new Date();
    this.servicioCicloLectivo
      .obtenerActualYSiguiente()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((response) => {
        this.aniosCiclos = response.añosCiclos;
      });
    this.cicloLectivoService
      .obtenerEstadoCicloLectivo()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((response) => {
        if (response.estadoCiclo == "En examenes") {
          this.fechaDentroDeRangoExamen = true;
        } else {
          this.fechaDentroDeRangoExamen = false;
        }

        if (
          this.fechaDentroDeRangoExamen ||
          this.authService.getRol() == "Admin"
        ) {
          this.apellidoEstudiante = this.estudianteService.estudianteSeleccionado.apellido;
          this.nombreEstudiante = this.estudianteService.estudianteSeleccionado.nombre;
          this.servicioCalificaciones
            .obtenerMateriasDesaprobadasEstudiante(
              this.estudianteService.estudianteSeleccionado._id
            )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((materias) => {
              this.materiasDesaprobadas = materias.materiasDesaprobadas;
            });
          this.fechaActualFinDeSemana();
        }
      });
  }

  onMateriaChange(materia) {
    this.idMateriaSeleccionada = materia._id;
    this.idCursoMateria = materia.cursoId;
  }

  onCondicionChage(condicion) {
    this.condicionExamen = condicion;
  }

  checkNotas(event) {
    var inputValue = event.which;
    var concat = this.notaExamen + String.fromCharCode(inputValue);
    if (
      !(inputValue >= 48 && inputValue <= 57) &&
      inputValue != 32 &&
      inputValue != 0
    )
      event.preventDefault();
    else if (this.notaExamen != "" && Number(concat) > 10)
      event.preventDefault();
  }

  fechaActualFinDeSemana() {
    if (
      this.fechaActual.toString().substring(0, 3) == "Sat" ||
      this.fechaActual.toString().substring(0, 3) == "Sun"
    ) {
      this.snackBar.open(
        "Considere que está queriendo registrar una calificación de examen en un fin de semana",
        "",
        {
          panelClass: ["snack-bar-aviso"],
          duration: 8000,
        }
      );
    }
  }

  guardar(form: NgForm) {
    if (form.invalid) {
      this.snackBar.open("Faltan campos por completar", "", {
        panelClass: ["snack-bar-fracaso"],
        duration: 3000,
      });
    } else {
      if (this.condicionExamen == "aprobado" && this.notaExamen > 5) {
        this.servicioCalificaciones
          .registrarCalificacionExamen(
            this.idMateriaSeleccionada,
            this.notaExamen,
            this.idCursoMateria
          )
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((rtdo) => {
            if (rtdo.exito) {
              this.resetearForm();
              this.snackBar.open(rtdo.message, "", {
                panelClass: ["snack-bar-exito"],
                duration: 3000,
              });
              this.servicioCalificaciones
                .obtenerMateriasDesaprobadasEstudiante(
                  this.estudianteService.estudianteSeleccionado._id
                )
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((materias) => {
                  this.materiasDesaprobadas = materias.materiasDesaprobadas;
                });
            } else {
              this.snackBar.open(rtdo.message, "", {
                panelClass: ["snack-bar-fracaso"],
                duration: 3000,
              });
            }
          });
      } else if (this.condicionExamen == "aprobado" && this.notaExamen < 6) {
        this.snackBar.open(
          "La calificación ingresada debe ser mayor o igual a 6.",
          "",
          {
            panelClass: ["snack-bar-fracaso"],
            duration: 3000,
          }
        );
      } else {
        this.resetearForm();
        this.snackBar.open("Se ha registrado la materia desaprobada.", "", {
          panelClass: ["snack-bar-exito"],
          duration: 3000,
        });
      }
    }
  }

  resetearForm() {
    this.condicionExamen = null;
    this.idMateriaSeleccionada = null;
    this.idCursoMateria = null;
    this.notaExamen = null;
  }
}
