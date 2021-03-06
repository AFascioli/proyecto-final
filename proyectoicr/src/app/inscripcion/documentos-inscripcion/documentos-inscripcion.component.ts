import { CicloLectivoService } from "./../../cicloLectivo.service";
import { CancelPopupComponent } from "src/app/popup-genericos/cancel-popup.component";
import { InscripcionService } from "../inscripcion.service";
import { AutenticacionService } from "src/app/login/autenticacionService.service";
import { EstudiantesService } from "src/app/estudiantes/estudiante.service";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { MatDialog, MatDialogConfig, MatSnackBar } from "@angular/material";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MediaMatcher } from "@angular/cdk/layout";

@Component({
  selector: "app-documentos-inscripcion",
  templateUrl: "./documentos-inscripcion.component.html",
  styleUrls: ["./documentos-inscripcion.component.css"],
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
    "informeAnt",
  ];
  matConfig = new MatDialogConfig();
  documentosEntregadosOnChange = false;
  isLoading = true;
  isLoading2 = false;
  aniosCiclos;
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
    public media: MediaMatcher,
    public servicioCicloLectivo: CicloLectivoService
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 880px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit() {
    this.servicioCicloLectivo
      .obtenerActualYSiguiente()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((response) => {
        this.aniosCiclos = response.añosCiclos;
        this.servicioEstudiante
          .obtenerCursos(response.añosCiclos[0])
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((response) => {
            this.cursos = response.cursos;
            this.cursos.sort((a, b) =>
              a.nombre.charAt(0) > b.nombre.charAt(0)
                ? 1
                : b.nombre.charAt(0) > a.nombre.charAt(0)
                ? -1
                : 0
            );
            this.isLoading = false;
          });
      });
  }

  //Cuando el usuario selecciona una division, se obtienen los datos del estudiantes necesarios
  onCursoSeleccionado(curso) {
    this.isLoading2 = true;
    this.cursoSeleccionado = true;
    this.servicioInscripcion
      .obtenerDocumentosDeEstudiantesXCurso(curso.value)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((estudiantes) => {
        this.estudiantesConDocumentos = estudiantes.documentos;
        if (estudiantes.documentos.length != 0) {
          this.estudiantesConDocumentos = this.estudiantesConDocumentos.sort(
            (a, b) =>
              a.datosEstudiante[0].apellido.toLowerCase() >
              b.datosEstudiante[0].apellido.toLowerCase()
                ? 1
                : b.datosEstudiante[0].apellido.toLowerCase() >
                  a.datosEstudiante[0].apellido.toLowerCase()
                ? -1
                : 0
          );
        }
        this.isLoading2 = false;
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
      .subscribe((response) => {
        if (response.exito) {
          this.snackBar.open(
            "Se registró correctamente la documentación de los estudiantes",
            "",
            {
              panelClass: ["snack-bar-exito"],
              duration: 4000,
            }
          );
        } else {
          this.snackBar.open("Ocurrió un problema al tratar de guardar", "", {
            panelClass: ["snack-bar-fracaso"],
            duration: 4500,
          });
        }
      });
  }

  onCancelar() {
    this.popup.open(CancelPopupComponent, {
      width: "250px",
    });
  }
}
