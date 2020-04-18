import { Component, OnInit, OnDestroy } from "@angular/core";
import { AsistenciaService } from "src/app/asistencia/asistencia.service";
import { Label } from "ng2-charts";
import { ChartOptions, ChartType } from "chart.js";
import * as pluginDataLabels from "chartjs-plugin-datalabels";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
  selector: "app-inasistencias-estudiante",
  templateUrl: "./inasistencias-estudiante.component.html",
  styleUrls: ["./inasistencias-estudiante.component.css"],
})
export class InasistenciasEstudianteComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ["tipo", "cantidad"];
  contadorInasistenciaJustificada: number;
  contadorInasistenciaInjustificada: number;
  barChartLabels: Label[]=[];
  private unsubscribe: Subject<void> = new Subject();
  public barChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      labels: {
        fontSize: 18
      }
    },
    plugins: {
      datalabels: {
        font: {
          size: 20,
          weight: "bold"
        }
      }
    }
  };
  barDataSet=[];

  public barChartType: ChartType = "pie";
  public barChartPlugins = [pluginDataLabels];
  public barChartLegend;

  constructor(public servicioAsistencia: AsistenciaService) {}

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit() {
    this.servicioAsistencia
      .obtenerInasistenciasDeEstudiante()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (response) => {
          this.contadorInasistenciaInjustificada =
            response.contadorInasistenciasInjustificada;
          this.contadorInasistenciaJustificada =
            response.contadorInasistenciasJustificada;

          this.barDataSet=[
            {
              backgroundColor: ["rgb(263, 210, 97)","rgb(255, 185, 97)"],
              data: [
                response.contadorInasistenciasInjustificada,
                response.contadorInasistenciasJustificada
              ]
            }
          ];

          this.barChartLabels = [
            "Inasistencias injustificadas",
            "Inasistencias justificadas"
          ];
        },
        (error) => {
          console.error(
            "Ocurrió un error al querer devolver los contadores de inasistencias. El error se puede describir de la siguiente manera: " +
              error
          );
        }
      );
  }
}
