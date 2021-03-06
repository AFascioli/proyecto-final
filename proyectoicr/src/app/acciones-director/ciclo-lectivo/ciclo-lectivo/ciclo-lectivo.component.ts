import { CicloLectivoService } from "./../../../cicloLectivo.service";
import {
  Component,
  OnInit,
  Inject,
  NgZone,
  ViewChild,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { take } from "rxjs/operators";
import { MediaMatcher } from "@angular/cdk/layout";

export interface DialogData {
  name: string;
  resultYes: boolean;
  mensaje: string;
  materia: string;
}

@Component({
  selector: "app-ciclo-lectivo",
  templateUrl: "./ciclo-lectivo.component.html",
  styleUrls: ["./ciclo-lectivo.component.css"],
})
export class CicloLectivoComponent implements OnInit {
  @Output() actualizarML = new EventEmitter<string>();
  iniciarCursado: Boolean = true;
  primerTrimestre: Boolean;
  segundoTrimestre: Boolean;
  tercerTrimestre: Boolean;
  fechasExamen: Boolean;
  name: string;
  id;
  mostrarMateria;
  _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;

  constructor(
    public dialog: MatDialog,
    public servicioCicloLectivo: CicloLectivoService,
    private snackBar: MatSnackBar,
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 700px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  openPopUp(): void {
    const dialogRef = this.dialog.open(PopUpCerrarEtapa, {
      width: "250px",
      data: { name: this.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (this.id) {
          case 1:
            this.onIniciarCursado();
            break;
          case 2:
            this.cerrarTrimestre(1);
            break;
          case 3:
            this.cerrarTrimestre(2);
            break;
          case 4:
            this.cerrarTrimestre(3);
            break;
          case 5:
            this.cerrarEtapaExamenes();
            break;
        }
      }
    });
  }

  ngOnInit() {
    this.servicioCicloLectivo
      .obtenerEstadoCicloLectivo()
      .subscribe((response) => {
        switch (response.estadoCiclo) {
          case "En primer trimestre":
            this.onVariableChange(1);
            break;
          case "En segundo trimestre":
            this.onVariableChange(2);
            break;
          case "En tercer trimestre":
            this.onVariableChange(3);
            break;
          case "En examenes":
            this.onVariableChange(4);
            break;
          case "Fin examenes":
            this.onVariableChange(5);
            break;
        }
      });
  }

  onVariableChange(nroEstado) {
    this.primerTrimestre = false;
    this.segundoTrimestre = false;
    this.tercerTrimestre = false;
    this.iniciarCursado = false;
    this.fechasExamen = false;

    switch (nroEstado) {
      case 1:
        this.primerTrimestre = true;
        break;
      case 2:
        this.segundoTrimestre = true;
        break;
      case 3:
        this.tercerTrimestre = true;
        break;
      case 4:
        this.fechasExamen = true;
        break;
      case 5:
        this.iniciarCursado = true;
        break;
    }
  }

  onCierreInicioCursado() {
    this.servicioCicloLectivo.esInicioCursado = true;
    this.id = 1;
    this.name = "iniciar el ciclo lectivo";
    this.openPopUp();
  }

  onCierrePrimerTrimestre() {
    this.servicioCicloLectivo.esInicioCursado = false;
    this.id = 2;
    this.name = "cerrar el primer trimestre";
    this.openPopUp();
  }

  onCierreSegundoTrimestre() {
    this.servicioCicloLectivo.esInicioCursado = false;
    this.id = 3;
    this.name = "cerrar el segundo trimestre";
    this.openPopUp();
  }

  onCierreTercerTrimestre() {
    this.servicioCicloLectivo.esInicioCursado = false;
    this.id = 4;
    this.name = "cerrar el tercer trimestre";
    this.openPopUp();
  }

  onCierreExamenes() {
    this.servicioCicloLectivo.esInicioCursado = false;
    this.id = 5;
    this.name = "finalizar las fechas de examen";
    this.openPopUp();
  }

  cerrarEtapaExamenes() {
    this.servicioCicloLectivo.cierreEtapaExamenes().subscribe((response) => {
      if (response.exito) {
        this.showSnackbar(response.message, "snack-bar-exito");
        this.onVariableChange(5);
        this.servicioCicloLectivo.actualizarMenuLateral();
      } else {
        this.showSnackbar(response.message, "snack-bar-fracaso");
      }
    });
  }

  onIniciarCursado() {
    this.servicioCicloLectivo.inicioCursado().subscribe((response) => {
      if (response.exito) {
        this.showSnackbar(response.message, "snack-bar-exito");
        this.onVariableChange(1);
        this.servicioCicloLectivo.actualizarMenuLateral();
      } else {
        this.dialog.open(PopUpMateriasSinCerrar, {
          width: "250px",
          data: { mensaje: response.message },
        });
      }
    });
  }

  cerrarTrimestre(trimestre) {
    this.servicioCicloLectivo
      .cierreTrimestre(trimestre)
      .subscribe((response) => {
        if (response.exito) {
          this.onVariableChange(trimestre + 1);
          this.showSnackbar(response.message, "snack-bar-exito");
          this.servicioCicloLectivo.actualizarMenuLateral();
        } else {
          let cursosYMaterias = "";
          for (const cursoYMateria of response.materiasSinCerrar) {
            cursosYMaterias += `${cursoYMateria.materia} de ${cursoYMateria.curso}, `;
          }
          let mensaje = response.message;

          let materias = cursosYMaterias.slice(0, cursosYMaterias.length - 2);

          this.dialog.open(PopUpMateriasSinCerrar, {
            width: "250px",
            data: { mensaje: mensaje, materia: materias },
          });
        }
      });
  }

  showSnackbar(mensaje, tipo) {
    this.snackBar.open(mensaje, "", {
      panelClass: [tipo],
      duration: 4000,
    });
  }
}

@Component({
  selector: "popUp-cerrarEtapa",
  templateUrl: "../popUp-cerrarEtapa.html",
  styleUrls: ["../ciclo-lectivo/ciclo-lectivo.component.css"],
})
export class PopUpCerrarEtapa {
  constructor(
    public dialogRef: MatDialogRef<PopUpCerrarEtapa>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }
  onYesClick() {
    this.dialogRef.close(true);
  }
}

@Component({
  selector: "popUp-materiasSinCerrar",
  templateUrl: "../popUp-materiasSinCerrar.html",
  styleUrls: ["../ciclo-lectivo/ciclo-lectivo.component.css"],
})
export class PopUpMateriasSinCerrar implements OnInit {
  mostrarMateria;
  esInicioCursado;
  constructor(
    public dialogRef: MatDialogRef<PopUpCerrarEtapa>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _ngZone: NgZone,
    public servicioCicloLectivo: CicloLectivoService
  ) {}
  ngOnInit() {
    this.mostrarMateria = false;
    this.esInicioCursado = this.servicioCicloLectivo.esInicioCursado;
  }

  @ViewChild("autosize", { static: true }) autosize: CdkTextareaAutosize;

  onOkClick(): void {
    this.dialogRef.close();
  }
  mostrarMaterias() {
    this.mostrarMateria = !this.mostrarMateria;
  }
}
