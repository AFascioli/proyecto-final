import { CancelPopupComponent } from "src/app/popup-genericos/cancel-popup.component";
import { InscripcionService } from "../inscripcion.service";
import { AutenticacionService } from "src/app/login/autenticacionService.service";
import { EstudiantesService } from "src/app/estudiantes/estudiante.service";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { MatDialog, MatDialogConfig, MatSnackBar } from "@angular/material";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: "app-documentos-inscripcion",
  templateUrl: "./documentos-inscripcion.component.html",
  styleUrls: ["./documentos-inscripcion.component.css"]
})
export class DocumentosInscripcionComponent implements OnInit, OnDestroy {
  cursos: any[];
  cursoSeleccionado: boolean = false;
  estudiantesConDocumentos: any[] = [];
  displayedColumns: string[] = [
    "apellido",
    "nombre",
    "fotocopiaDoc",
    "fichaMed",
    "informeAnt"
  ];
  matConfig = new MatDialogConfig();
  documentosEntregadosOnChange = false;
  fueraPeriodoCicloLectivo = false;
  fechaActual: Date;
  isLoading = true;
  private unsubscribe: Subject<void> = new Subject();
  _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;

  constructor(
    public servicioEstudiante: EstudiantesService,
    public servicioInscripcion: InscripcionService,
    public autenticacionService: AutenticacionService,
    public popup: MatDialog,
    private snackBar: MatSnackBar,
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 880px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  //Sort ordena solo por año de curso, para ordenar bien, deberia dsp de el sort que esta ahora
  //tomar de a dos cursos y ordenarlos alfabeticamente, de esa forma quedan ordenados por año y
  //division
  ngOnInit() {
    this.fechaActual = new Date();
    if (
      this.fechaActualEnCicloLectivo() ||
      this.autenticacionService.getRol() == "Admin"
    ) {
      this.servicioEstudiante
        .obtenerCursos()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(response => {
          this.cursos = response.cursos;
         // this.cursos.sort((a, b) =>
         //   a.curso.charAt(0) > b.curso.charAt(0)
          //    ? 1
          //    : b.curso.charAt(0) > a.curso.charAt(0)
         //    ? -1
         //     : 0
      //    );
      this.isLoading = false;
        });
    } else {
      this.fueraPeriodoCicloLectivo = true;
    }
  }

  fechaActualEnCicloLectivo() {
    let fechaInicioInscripcion = new Date(
      this.autenticacionService.getFechasCicloLectivo().fechaInicioInscripcion
    );
    let fechaFinTercerTrimestre = new Date(
      this.autenticacionService.getFechasCicloLectivo().fechaFinTercerTrimestre
    );

    return (
      this.fechaActual.getTime() > fechaInicioInscripcion.getTime() &&
      this.fechaActual.getTime() < fechaFinTercerTrimestre.getTime()
    );
  }

  //Cuando el usuario selecciona una division, se obtienen los datos del estudiantes necesarios
  onCursoSeleccionado(curso) {
    this.cursoSeleccionado = true;
    this.servicioInscripcion
      .obtenerDocumentosDeEstudiantesXCurso(curso.value)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(estudiantes => {
        this.estudiantesConDocumentos = estudiantes.documentos;
        this.estudiantesConDocumentos = this.estudiantesConDocumentos.sort(
          (a, b) =>
            a.datosEstudiante[0].apellido > b.datosEstudiante[0].apellido
              ? 1
              : b.datosEstudiante[0].apellido > a.datosEstudiante[0].apellido
              ? -1
              : 0
        );

      });
    this.documentosEntregadosOnChange = false;
  }

  //Cambia el valor del atributo documentoEntregado.entregado del documento seleccionado
  registrarCambioDocumento(estudiante: any, indiceDoc: number) {
    estudiante.documentosEntregados[indiceDoc].entregado = !estudiante
      .documentosEntregados[indiceDoc].entregado;
    this.documentosEntregadosOnChange = true;
  }

  //Guardar los estudiantes con los cambios, resetea los selects y abre snackBar
  onGuardar() {
    this.servicioInscripcion
      .registrarDocumentosInscripcion(this.estudiantesConDocumentos)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(response => {
        if (response.exito) {
          this.snackBar.open(
            "Se registró correctamente la documentación de los estudiantes",
            "",
            {
              panelClass: ["snack-bar-exito"],
              duration: 4000
            }
          );
        } else {
          this.snackBar.open("Ocurrió un problema al tratar de guardar", "", {
            panelClass: ["snack-bar-fracaso"],
            duration: 4500
          });
        }
      });
  }

  onCancelar() {
    this.popup.open(CancelPopupComponent, {
      width: "250px"
    });
  }
}
