import { EstudiantesService } from "src/app/estudiantes/estudiante.service";
import { AdultoResponsable } from "../adultoResponsable.model";
import { AdultoResponsableService } from "../adultoResponsable.service";
import { Component, OnInit } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { NgForm } from "@angular/forms";
import { Subject } from "rxjs";
import { MatDialog, MatSnackBar } from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";

@Component({
  selector: "app-buscar-adulto-responsable",
  templateUrl: "./buscar-adulto-responsable.component.html",
  styleUrls: ["./buscar-adulto-responsable.component.css"],
})
export class BuscarAdultoResponsableComponent implements OnInit {
  buscarPorNomYAp = true;
  ARFiltrados: any[] = [];
  private unsubscribe: Subject<void> = new Subject();
  seleccion = new SelectionModel(true, []);
  displayedColumns: string[];
  displayedColumnsAsociados: string[] = [
    "apellido",
    "nombre",
    "numerodocumento",
    "telefono",
  ];
  busqueda: boolean = false;

  constructor(
    public dialog: MatDialog,
    public servicio: AdultoResponsableService,
    public estudiantesService: EstudiantesService,
    private snackBar: MatSnackBar,
    public popup: MatDialog
  ) {}

  ngOnInit() {
  }

  setColumns() {
    this.displayedColumns = [
      "apellido",
      "nombre",
      "telefono",
      "tipoDocumento",
      "nroDocumento",
      "editar"
    ];
  }
  // Si el formulario no es valido no hace nada, luego controla que tipo de busqueda es
  onBuscar(form: NgForm) {
    if (form.valid) {
      this.busqueda = true;
      if (this.buscarPorNomYAp) {
        this.servicio
          .buscarAdultoResponsableXNombre(
            form.value.nombre.trim(),
            form.value.apellido.trim()
          )
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((response) => {
            this.ARFiltrados = response.adultosResponsables;
            this.setColumns();
          });
      } else {
        this.servicio
          .buscarAdultoResponsableXDocumento(
            form.value.tipoDocumento,
            form.value.numeroDocumento
          )
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((response) => {
            this.setColumns();
          });
      }
    } else {
      this.snackBar.open("Faltan campos por completar", "", {
        panelClass: ["snack-bar-fracaso"],
        duration: 4000,
      });
    }
  }

  checkLetras(event) {
    var inputValue = event.which;
    if (
      !(
        (inputValue >= 65 && inputValue <= 122) ||
        inputValue == 209 ||
        inputValue == 241
      ) &&
      inputValue != 32 &&
      inputValue != 0
    ) {
      event.preventDefault();
    }
  }

  deshabilitarInputs(form: NgForm) {
    this.buscarPorNomYAp = !this.buscarPorNomYAp;
    form.resetForm();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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
}