import { Component, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { EstudiantesService } from "src/app/estudiantes/estudiante.service";
import { SancionService } from "../sancion.service";
import { MatSnackBar } from "@angular/material";
import { format } from "url";
import { NgForm } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MediaMatcher } from "@angular/cdk/layout";

@Component({
  selector: "app-registrar-sanciones",
  templateUrl: "./registrar-sanciones.component.html",
  styleUrls: ["./registrar-sanciones.component.css"]
})
export class RegistrarSancionesComponent implements OnInit, OnDestroy {
  fechaActual: Date;
  apellidoEstudiante: String;
  nombreEstudiante: String;
  idEstudiante: String;
  tiposSanciones = [
    "Llamado de atención",
    "Apercibimiento",
    "Amonestación",
    "Suspensión"
  ];
  tipoSancionSelected: Boolean = false;
  suspensionSelected: Boolean = false;
  private unsubscribe: Subject<void> = new Subject();
  _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;

  constructor(
    public servicioEstudiante: EstudiantesService,
    public servicioSancion: SancionService,
    public snackBar: MatSnackBar,
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher
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
    this.apellidoEstudiante = this.servicioEstudiante.estudianteSeleccionado.apellido;
    this.nombreEstudiante = this.servicioEstudiante.estudianteSeleccionado.nombre;
    this.idEstudiante = this.servicioEstudiante.estudianteSeleccionado._id;
  }

  onTipoSancionChange(tipoSancion) {
    this.tipoSancionSelected = true;
    if (tipoSancion == 3) {
      this.suspensionSelected = true;
    } else {
      this.suspensionSelected = false;
    }
  }

  checkNumeros(event) {
    var inputValue = event.which;
    if (
      !(inputValue >= 48 && inputValue <= 57) &&
      inputValue != 32 &&
      inputValue != 0
    ) {
      event.preventDefault();
    }
  }

  guardar(cantidad, tipoSancion, form: NgForm) {
    let sancion = "";
    switch (tipoSancion) {
      case 0:
        sancion = "Llamado de atencion";
        break;
      case 1:
        sancion = "Apercibimiento";
        break;
      case 2:
        sancion = "Amonestacion";
        break;
      case 3:
        sancion = "Suspencion";
        cantidad = 1;
        break;
    }
    this.servicioSancion
      .registrarSancion(this.fechaActual, cantidad, sancion, this.idEstudiante)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(rtdo => {
        if (rtdo.exito) {
          this.snackBar.open(rtdo.message, "", {
            panelClass: ["snack-bar-exito"],
            duration: 8000
          });
          form.resetForm();
        }
      });
  }
}