import { InscripcionService } from "../inscripcion.service";
import { EstudiantesService } from "../../estudiantes/estudiante.service";
import { OnInit, Component, Inject, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatSnackBar
} from "@angular/material";
import { NgForm } from "@angular/forms";
import { MediaMatcher } from "@angular/cdk/layout";
import { AutenticacionService } from "src/app/login/autenticacionService.service";

@Component({
  selector: "app-inscripcion-estudiantes",
  templateUrl: "./inscripcion-estudiantes.component.html",
  styleUrls: ["./inscripcion-estudiantes.component.css"]
})
export class InscripcionEstudianteComponent implements OnInit {
  cursos: any[];
  diaActual: string;
  cursoSeleccionado: string;
  capacidadCurso: number;
  apellidoEstudiante: string;
  nombreEstudiante: string;
  _idEstudiante: string;
  matConfig = new MatDialogConfig();
  seleccionDeAnio: boolean = false;
  fechaActual: Date;
  estudianteEstaInscripto: boolean;
  documentosEntregados = [
    { nombre: "Fotocopia documento", entregado: false },
    { nombre: "Ficha medica", entregado: false },
    { nombre: "Informe año anterior", entregado: false }
  ];
  _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;
  fechaDentroDeRangoInscripcion: boolean = true;

  constructor(
    public servicioEstudiante: EstudiantesService,
    public servicioInscripcion: InscripcionService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public changeDetectorRef: ChangeDetectorRef,
    public authService: AutenticacionService,
    public media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 1000px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.fechaActual = new Date();
    if (
      this.fechaActualEnRangoFechasInscripcion() ||
      this.authService.getRol() == "Admin"
    ) {
      this.fechaDentroDeRangoInscripcion = true;
    }
    this.authService.getFechasCicloLectivo();
    this.apellidoEstudiante = this.servicioEstudiante.estudianteSeleccionado.apellido;
    this.nombreEstudiante = this.servicioEstudiante.estudianteSeleccionado.nombre;
    this._idEstudiante = this.servicioEstudiante.estudianteSeleccionado._id;
    this.servicioEstudiante
      .estudianteEstaInscripto(this._idEstudiante)
      .subscribe(response => {
        this.estudianteEstaInscripto = response.exito;
      });
    this.servicioInscripcion
      .obtenerCursosInscripcionEstudiante()
      .subscribe(response => {
        this.cursos = response.cursos;
        this.cursos.sort((a, b) =>
          a.curso.charAt(0) > b.curso.charAt(0)
            ? 1
            : b.curso.charAt(0) > a.curso.charAt(0)
            ? -1
            : 0
        );
        console.log(this.cursos[0].curso);
      });


  }

  fechaActualEnRangoFechasInscripcion() {
    let fechaInicioInscripcion = new Date(
      this.authService.getFechasCicloLectivo().fechaInicioInscripcion
    );
    let fechaFinInscripcion = new Date(
      this.authService.getFechasCicloLectivo().fechaFinInscripcion
    );

    return (
      this.fechaActual.getTime() > fechaInicioInscripcion.getTime() &&
      this.fechaActual.getTime() < fechaFinInscripcion.getTime()
    );
  }

  //Obtiene la capacidad del curso seleccionado
  onCursoSeleccionado(curso) {
    this.cursoSeleccionado = curso.value;
    this.servicioInscripcion
      .obtenerCapacidadCurso(curso.value)
      .subscribe(response => {
        this.capacidadCurso = response.capacidad;
      });
  }

  //Cambia el valor de entregado del documento seleccionado por el usuario
  registrarDocumento(indexDoc: number) {
    this.documentosEntregados[indexDoc].entregado = !this.documentosEntregados[
      indexDoc
    ].entregado;
  }

  openDialogo(form: NgForm) {
    if (form.invalid) {
      this.snackBar.open("No se ha seleccionado un curso", "", {
        panelClass: ["snack-bar-fracaso"],
        duration: 4500
      });
    } else {
      if (this.capacidadCurso == 0) {
        this.snackBar.open(
          "El curso seleccionado no tiene más cupos disponibles",
          "",
          {
            panelClass: ["snack-bar-fracaso"],
            duration: 4500
          }
        );
      } else {
        this.matConfig.data = {
          formValido: form.valid,
          IdEstudiante: this._idEstudiante,
          curso: this.cursoSeleccionado,
          documentosEntregados: this.documentosEntregados
        };
        this.matConfig.width = "250px";
        const dialogRef = this.dialog.open(InscripcionPopupComponent, this.matConfig);
        dialogRef.afterClosed().subscribe((result)=>{
          if(result.data){
            this.estudianteEstaInscripto=true;
          }
        })
      }
    }
  }
}

@Component({
  selector: "app-inscripcion-popup",
  templateUrl: "./inscripcion-popup.component.html",
  styleUrls: [
    "./inscripcion-estudiantes.component.css",
    "../../app.component.css"
  ]
})
export class InscripcionPopupComponent {
  tipoPopup: string;
  formValido: boolean;
  IdEstudiante: string;
  curso: string;
  exito: boolean = false;
  documentosEntregados: any[];
  isLoading: Boolean=false;

  constructor(
    public dialogRef: MatDialogRef<InscripcionPopupComponent>,
    public router: Router,
    public servicioEstudiante: EstudiantesService,
    public servicioInscripcion: InscripcionService,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.formValido = data.formValido;
    this.IdEstudiante = data.IdEstudiante;
    this.curso = data.curso;
    this.documentosEntregados = data.documentosEntregados;
  }

  onNoCancelarConfirmarClick(): void {
    this.dialogRef.close();
  }

  onYesConfirmarClick(): void {
    this.isLoading=true;
    this.dialogRef.close();
    this.servicioInscripcion
      .inscribirEstudiante(
        this.IdEstudiante,
        this.curso,
        this.documentosEntregados
      )
      .subscribe(response => {
        this.exito = response.exito;
        if (this.exito) {
          this.snackBar.open(response.message, "", {
            panelClass: ["snack-bar-exito"],
            duration: 4500
          });
          this.isLoading=false;
          this.dialogRef.close({event:'close',data:this.exito});
        } else {
          this.snackBar.open(response.message, "", {
            duration: 4500,
            panelClass: ["snack-bar-fracaso"]
          });
          this.isLoading=false;
          this.dialogRef.close({event:'close',data:this.exito});
        }
      });

  }
}