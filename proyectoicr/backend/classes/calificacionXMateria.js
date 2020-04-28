const CalificacionesXTrimestre = require("../models/calificacionesXTrimestre");
const CalificacionesXMateria = require("../models/calificacionesXMateria");

exports.obtenerPromedioDeTrimestre = function (calificaciones) {
  let contador = 0;
  let promedioTrimestre = 0;
  calificaciones.forEach((calificacion) => {
    if (calificacion != 0) {
      contador = contador + 1;
      promedioTrimestre += calificacion;
    }
  });

  if (contador != 0) {
    promedioTrimestre = promedioTrimestre / contador;
  }

  return promedioTrimestre;
};

// Añade al vector de materias desaprobadas las materias pendientes de otros años y
//las materias del año actual que también se encuentren desaprobadas
exports.obtenerMateriasDesaprobadas = async function (
  arrayPendientes,
  arrayCXMTotal,
  arrayNombresCXM
) {
  materiasDesaprobadas = [];
  if (arrayPendientes.length != 0) {
    materiasDesaprobadas.push(arrayPendientes);
  }

  for (i = 0; i < arrayCXMTotal.length - 1; i++) {
    if (arrayCXMTotal[i].promedio < 6) {
      for (j = 0; j < arrayNombresCXM.length - 1; j++) {
        //Necesita el casteo sino me lo compara mal
        if (
          arrayNombresCXM[j]._id.toString() ===
          arrayCXMTotal[i].idMateria.toString()
        ) {
          materiasDesaprobadas.push(arrayNombresCXM[j]);
        }
      }
    }
  }

  return materiasDesaprobadas;
};

exports.crearCalifXTrimestre = async function (califXMateriaNueva) {
  let idsCalXMateria = [];
  let idsCalificacionMatXTrim = [];
  //vas a crear las calificacionesXTrimestre de cada materia
  for (let i = 0; i < 3; i++) {
    let calificacionesXTrim = new CalificacionesXTrimestre({
      calificaciones: [0, 0, 0, 0, 0, 0],
      trimestre: i + 1,
    });
    calificacionesXTrim.save().then(async (calXMateriaXTrimestre) => {
      await idsCalificacionMatXTrim.push(calXMateriaXTrimestre._id);
      califXMateriaNueva.calificacionesXTrimestre = idsCalificacionMatXTrim;
      califXMateriaNueva.save();
    });
    if ((i = 3)) {
      idsCalXMateria.push(califXMateriaNueva._id);

      return idsCalXMateria;
    }
  }
};

exports.crearDocsCalif = async function (materiasDelCurso, estado) {
  let idsCalXMateria = [];
  materiasDelCurso.forEach((elemento) => {
    let califXMateriaNueva = new CalificacionesXMateria({
      idMateria: elemento.materiasDelCurso[0].materia,
      estado: estado._id,
      calificacionesXTrimestre: idsCalXMateria,
    });

    //Creamos las califXMateria
    this.crearCalifXTrimestre(califXMateriaNueva).then(
      async (idsCalificacionMat) => {
        return await idsCalificacionMat;
      }
    );
  });
};

//Crear todas las CalificacionXMateria necesarias con sus respectivas CalificacionesXTrimestre
//@param: Array con ids de las materias de un curso
//@param: Id del estado Cursando de CalificacionXMateria
exports.crearCXM = async function (materiasDelCurso, estado) {
  var obtenerCXT = (trimestre) => {
    return new Promise((resolve, reject) => {
      let calificacionesXTrim = new CalificacionesXTrimestre({
        calificaciones: [0, 0, 0, 0, 0, 0],
        trimestre: trimestre,
      });
      calificacionesXTrim.save().then(async (calXMateriaXTrimestre) => {
        resolve(calXMateriaXTrimestre._id);
      });
    });
  };

  var obtenerCXMParaInscripcion = (idMateria, estado) => {
    return new Promise(async (resolve, reject) => {
      let idsCXT = [];
      //Se crean las CXT
      for (let i = 0; i < 3; i++) {
        var idCXT = await obtenerCXT(i + 1);
        idsCXT.push(idCXT);
      }
      let califXMateriaNueva = new CalificacionesXMateria({
        idMateria: idMateria,
        estado: estado,
        calificacionesXTrimestre: idsCXT,
      });

      //Se guarda la CXM y se devuelve la id
      califXMateriaNueva.save().then((cxmNueva) => {
        resolve(cxmNueva._id);
      });
    });
  };

  var idsCalXMateria = [];
  for (const materia of materiasDelCurso) {
    var idCXM = await obtenerCXMParaInscripcion(
      materia._id.idMateria[0],
      estado._id
    );
    idsCalXMateria.push(idCXM);
  }
  return idsCalXMateria;
};

//Obtiene las CalificacionesXMateria desaprobadas. Retorna las ids de las CXM desaprobadas y pendientes
//@param: array con las ids de las CalificacionesXMateria
//@param: id del estado Desaprobada
exports.obtenerMateriasDesaprobadasv2 = async function (
  arrayPendientes,
  idsCalificacionesXMateria,
  idEstado
) {
  var idsCXMDesaprobadas = [];
  if (arrayPendientes.length != 0) {
    idsCXMDesaprobadas.push(arrayPendientes);
  }
  for (const cxm of idsCalificacionesXMateria) {
    await CalificacionesXMateria.findOne({ _id: cxm, estado: idEstado }).then(
      (cxmEncontrada) => {
        if (cxmEncontrada != null) {
          idsCXMDesaprobadas.push(cxm);
        }
      }
    );
  }
  return idsCXMDesaprobadas;
};

//Dados los 3 vectores de calificaciones calcula el promedio total
//@param: vector de calificaciones 1, 2 y 3 trimestre
exports.obtenerPromedioTotal = (trimestre1, trimestre2, trimestre3) => {
  return (
    (this.obtenerPromedioDeTrimestre(trimestre1) +
      this.obtenerPromedioDeTrimestre(trimestre2) +
      this.obtenerPromedioDeTrimestre(trimestre3)) /
    3
  );
};

//Dados los 3 vectores de calificaciones retorna un objeto que indica el estado y el promedio
//que tendra la CXM correspondiente
//@param: vector de calificaciones 1, 2 y 3 trimestre
exports.obtenerEstadoYPromedioCXM= (trimestre1, trimestre2, trimestre3) => {
  let promedioTrimestre3= this.obtenerPromedioDeTrimestre(trimestre3);
  let promedioGeneral=this.obtenerPromedioTotal(trimestre1, trimestre2, trimestre3);

  if(promedioTrimestre3<6){
    return {aprobado: false, promedio: promedioGeneral};
  }else{
    if(promedioGeneral<6){
      return {aprobado: false, promedio: promedioGeneral};
    }else{
      return {aprobado: true, promedio: promedioGeneral};
    }
  }
};
