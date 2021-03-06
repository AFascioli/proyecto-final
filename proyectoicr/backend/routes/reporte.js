const checkAuthMiddleware = require("../middleware/check-auth");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Inscripcion = require("../models/inscripcion");
const ClaseEstado = require("../classes/estado");

router.get("/documentos", checkAuthMiddleware, async (req, res) => {
  let idEstadoActiva = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Activa"
  );
  let idEstadoSuspendido = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Suspendido"
  );
  let idEstadoPromovidoConExPend = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Promovido con examenes pendientes"
  );
  let idEstadoExPendiente = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Examenes pendientes"
  );
  let idEstadoPromovido = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Promovido"
  );
  let idEstadoInactiva = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Inactiva"
  );
  Inscripcion.aggregate([
    {
      $match: {
        idCurso: mongoose.Types.ObjectId(req.query.idCurso),
        estado: {
          $in: [
            mongoose.Types.ObjectId(idEstadoActiva),
            mongoose.Types.ObjectId(idEstadoSuspendido),
            mongoose.Types.ObjectId(idEstadoPromovidoConExPend),
            mongoose.Types.ObjectId(idEstadoExPendiente),
            mongoose.Types.ObjectId(idEstadoPromovido),
            mongoose.Types.ObjectId(idEstadoInactiva),
          ],
        },
      },
    },
    {
      $unwind: {
        path: "$documentosEntregados",
      },
    },
    {
      $match: {
        "documentosEntregados.entregado": false,
      },
    },
    {
      $lookup: {
        from: "estudiante",
        localField: "idEstudiante",
        foreignField: "_id",
        as: "estudiante",
      },
    },
    {
      $unwind: {
        path: "$estudiante",
      },
    },
    {
      $addFields: {
        estudiante: {
          $concat: ["$estudiante.apellido", ", ", "$estudiante.nombre"],
        },
        documento: "$documentosEntregados.nombre",
      },
    },
    {
      $group: {
        _id: "$idEstudiante",
        nombres: {
          $first: "$estudiante",
        },
        documentos: {
          $push: "$documento",
        },
      },
    },
  ])
    .then((estudiantesXDocs) => {
      if (!estudiantesXDocs) {
        return res.status(200).json({
          exito: true,
          message:
            "No existe ningún estudiante que adeude documentos para este curso",
          estudiantesXDocs: [],
        });
      }
      res.status(200).json({
        exito: true,
        message:
          "Se obtuvieron correctamente los documentos adeudados por este curso",
        estudiantesXDocs: estudiantesXDocs,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Ocurrió un error al obtener los documentos adeudados",
        error: error.message,
      });
    });
});

router.get("/cuotas", checkAuthMiddleware, async (req, res) => {
  let idEstadoActiva = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Activa"
  );
  let idEstadoSuspendido = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Suspendido"
  );
  let idEstadoPromovidoConExPend = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Promovido con examenes pendientes"
  );
  let idEstadoExPendiente = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Examenes pendientes"
  );
  let idEstadoPromovido = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Promovido"
  );
  let idEstadoInactiva = await ClaseEstado.obtenerIdEstado(
    "Inscripcion",
    "Inactiva"
  );

  Inscripcion.aggregate([
    {
      $match: {
        idCurso: mongoose.Types.ObjectId(req.query.idCurso),
        estado: {
          $in: [
            mongoose.Types.ObjectId(idEstadoActiva),
            mongoose.Types.ObjectId(idEstadoSuspendido),
            mongoose.Types.ObjectId(idEstadoPromovidoConExPend),
            mongoose.Types.ObjectId(idEstadoExPendiente),
            mongoose.Types.ObjectId(idEstadoPromovido),
            mongoose.Types.ObjectId(idEstadoInactiva),
          ],
        },
      },
    },
    {
      $unwind: {
        path: "$cuotas",
      },
    },
    {
      $match: {
        "cuotas.pagado": false,
      },
    },
    {
      $lookup: {
        from: "estudiante",
        localField: "idEstudiante",
        foreignField: "_id",
        as: "estudiante",
      },
    },
    {
      $unwind: {
        path: "$estudiante",
      },
    },
    {
      $addFields: {
        estudiante: {
          $concat: ["$estudiante.apellido", ", ", "$estudiante.nombre"],
        },
        documento: "$documentosEntregados.nombre",
      },
    },
    {
      $group: {
        _id: "$idEstudiante",
        mesCuotas: {
          $push: "$cuotas.mes",
        },
        nombres: {
          $first: "$estudiante",
        },
      },
    },
  ])
    .then((estudiantesXCuotas) => {
      if (!estudiantesXCuotas) {
        return res.status(200).json({
          exito: true,
          message:
            "No existe ningún estudiante que adeude cuotas en este curso",
          estudiantesXCuotas: [],
        });
      }
      res.status(200).json({
        exito: true,
        message:
          "Se obtuvieron correctamente las cuotas adeudadas por este curso",
        estudiantesXCuotas: estudiantesXCuotas,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Ocurrió un error al obtener las cuotas adeudados",
        error: error.message,
      });
    });
});

router.get("/resumenAcademico", checkAuthMiddleware, async (req, res) => {
  Inscripcion.aggregate([
    {
      $match: {
        idEstudiante: mongoose.Types.ObjectId(req.query.idEstudiante),
      },
    },
    {
      $unwind: {
        path: "$calificacionesXMateria",
      },
    },
    {
      $lookup: {
        from: "calificacionesXMateria",
        localField: "calificacionesXMateria",
        foreignField: "_id",
        as: "calificacionesXMateriaDif",
      },
    },
    {
      $group: {
        _id: "$calificacionesXMateriaDif._id",
        idInscipcion: {
          $first: "$_id",
        },
        idEstudiante: {
          $first: "$idEstudiante",
        },
        calificacionesXTrimestre: {
          $push: {
            $arrayElemAt: [
              "$calificacionesXMateriaDif.calificacionesXTrimestre",
              0,
            ],
          },
        },
        materia: {
          $first: "$calificacionesXMateriaDif.idMateria",
        },
        sanciones: {
          $first: "$sanciones",
        },
        contadorInasistenciasInjustificada: {
          $first: "$contadorInasistenciasInjustificada",
        },
        contadorInasistenciasJustificada: {
          $first: "$contadorInasistenciasJustificada",
        },
        promedio: {
          $first: "$calificacionesXMateriaDif.promedio",
        },
      },
    },
    {
      $unwind: {
        path: "$calificacionesXTrimestre",
      },
    },
    {
      $unwind: {
        path: "$calificacionesXTrimestre",
      },
    },
    {
      $lookup: {
        from: "calificacionesXTrimestre",
        localField: "calificacionesXTrimestre",
        foreignField: "_id",
        as: "calificacionesTrim",
      },
    },
    {
      $group: {
        _id: "$calificacionesTrim._id",
        idMateriaXCalif: {
          $first: "$_id",
        },
        idEstudiante: {
          $first: "$idEstudiante",
        },
        calificaciones: {
          $first: "$calificacionesTrim.calificaciones",
        },
        trim: {
          $first: "$calificacionesTrim.trimestre",
        },
        materia: {
          $first: "$materia",
        },
        sanciones: {
          $first: "$sanciones",
        },
        contadorInasistenciasInjustificada: {
          $first: "$contadorInasistenciasInjustificada",
        },
        contadorInasistenciasJustificada: {
          $first: "$contadorInasistenciasJustificada",
        },
        promedio: {
          $first: "$promedio",
        },
      },
    },
    {
      $group: {
        _id: "$idMateriaXCalif",
        idEstudiante: {
          $first: "$idEstudiante",
        },
        calificaciones: {
          $push: "$calificaciones",
        },
        trimestre: {
          $push: "$trim",
        },
        materia: {
          $first: "$materia",
        },
        sanciones: {
          $first: "$sanciones",
        },
        contadorInasistenciasInjustificada: {
          $first: "$contadorInasistenciasInjustificada",
        },
        contadorInasistenciasJustificada: {
          $first: "$contadorInasistenciasJustificada",
        },
        promedio: {
          $first: "$promedio",
        },
      },
    },
    {
      $lookup: {
        from: "estudiante",
        localField: "idEstudiante",
        foreignField: "_id",
        as: "Estudiante",
      },
    },
    {
      $lookup: {
        from: "materia",
        localField: "materia",
        foreignField: "_id",
        as: "materia",
      },
    },
    {
      $project: {
        idEstudiante: 1,
        calificaciones: 1,
        trimestre: 1,
        nombre: {
          $arrayElemAt: ["$Estudiante.nombre", 0],
        },
        apellido: {
          $arrayElemAt: ["$Estudiante.apellido", 0],
        },
        Materia: {
          $arrayElemAt: ["$materia.nombre", 0],
        },
        sanciones: 1,
        promedio: 1,
        contadorInasistenciasInjustificada: 1,
        contadorInasistenciasJustificada: 1,
      },
    },
  ])
    .then((resumen) => {
      if (!resumen) {
        return res.status(200).json({
          exito: true,
          message: "No se obtuvieron resultados",
          resumen: [],
        });
      }
      res.status(200).json({
        exito: true,
        message: "Se obtuvo correctamente el resumen académico del estudiante",
        resumen: resumen,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message:
          "Ocurrió un error al obtener el resumen académico del estudiante",
        error: error.message,
      });
    });
});

module.exports = router;
