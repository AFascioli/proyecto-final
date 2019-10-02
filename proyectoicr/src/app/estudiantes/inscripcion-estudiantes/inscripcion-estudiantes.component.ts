import { EstudiantesService } from "../estudiante.service";
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

@Component({
  selector: "app-inscripcion-estudiantes",
  templateUrl: "./inscripcion-estudiantes.component.html",
  styleUrls: ["./inscripcion-estudiantes.component.css"]
})
export class InscripcionEstudianteComponent implements OnInit {
  cursos: any[];
  diaActual: string;
  apellidoEstudiante: string;
  nombreEstudiante: string;
  _idEstudiante: string;
  matConfig = new MatDialogConfig();
  seleccionDeAnio: boolean = false;
  fechaActual: Date;
  documentosEntregados = [
    { nombre: "Fotocopia documento", entregado: false },
    { nombre: "Ficha medica", entregado: false },
    { nombre: "Informe año anterior", entregado: false }
  ];
  _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;

  constructor(
    public servicio: EstudiantesService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 1000px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.fechaActual = new Date();
    this.apellidoEstudiante = this.servicio.estudianteSeleccionado.apellido;
    this.nombreEstudiante = this.servicio.estudianteSeleccionado.nombre;
    this._idEstudiante = this.servicio.estudianteSeleccionado._id;
    this.servicio.obtenerCursos().subscribe(response => {
      this.cursos = response.cursos;
      this.cursos.sort((a, b) =>
        a.curso.charAt(0) > b.curso.charAt(0)
          ? 1
          : b.curso.charAt(0) > a.curso.charAt(0)
          ? -1
          : 0
      );
    });
  }

  //Cambia el valor de entregado del documento seleccionado por el usuario
  registrarDocumento(indexDoc: number) {
    this.documentosEntregados[indexDoc].entregado = !this.documentosEntregados[
      indexDoc
    ].entregado;
  }

  openDialogo(tipo: string, form: NgForm, curso) {
    if (form.invalid) {
      this.snackBar.open("No se ha seleccionado un curso.", "", {
        panelClass: ['snack-bar-fracaso'],
        duration: 4500,
      });
    } else {
      this.matConfig.data = {
        tipoPopup: tipo,
        formValido: form.valid,
        IdEstudiante: this._idEstudiante,
        curso: curso.value,
        documentosEntregados: this.documentosEntregados
      };
      this.matConfig.width = "250px";
      this.dialog.open(InscripcionPopupComponent, this.matConfig);
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

  constructor(
    public dialogRef: MatDialogRef<InscripcionPopupComponent>,
    public router: Router,
    public servicio: EstudiantesService,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.tipoPopup = data.tipoPopup;
    this.formValido = data.formValido;
    this.IdEstudiante = data.IdEstudiante;
    this.curso = data.curso;
    this.documentosEntregados = data.documentosEntregados;
  }

  onYesCancelarClick(): void {
    this.router.navigate(["./home"]);
    this.dialogRef.close();
  }

  onNoCancelarConfirmarClick(): void {
    this.dialogRef.close();
  }

  onYesConfirmarClick(): void {
    this.servicio
      .inscribirEstudiante(
        this.IdEstudiante,
        this.curso,
        this.documentosEntregados
      )
      .subscribe(response => {
        this.exito = response.exito;
        if (this.exito) {
          this.snackBar.open("Estudiante inscripto correctamente", "", {
            panelClass: ['snack-bar-exito'],
            duration: 4500,
          });
        }else{
          this.snackBar.open("Inscripción no registrada. El estudiante selccionado ya se encuentra inscripto", "", {
            duration: 4500,
            panelClass: ['snack-bar-fracaso']
          });
        } else {
          this.snackBar.open(
            "Inscripción no registrada. El estudiante selccionado ya se encuentra inscripto",
            "",
            {
              duration: 4500
            }
          );
        }
        this.dialogRef.close();
      });
  }
}
