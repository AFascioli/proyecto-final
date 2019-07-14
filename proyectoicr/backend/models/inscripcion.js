const mongoose = require('mongoose');

const asistenciaSchema= mongoose.Schema({
  fecha: Date,
  presente: Boolean,
  retiroAnticipado: Boolean,
  valorInasistencia: Number
});

const inscripcionSchema = mongoose.Schema({
  IdEstudiante: {type: mongoose.Schema.Types.ObjectId, ref: 'estudiantes'},
  IdDivision: {type: mongoose.Schema.Types.ObjectId, ref: 'divisiones'},
  asistenciaDiaria: {type: [asistenciaSchema]},
  activa: {type: Boolean, require: true}
});

module.exports= mongoose.model('inscripcion', inscripcionSchema, 'inscripcion');
