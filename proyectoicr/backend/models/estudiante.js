const mongoose = require('mongoose');

const estudianteSchema = mongoose.Schema({
  apellido: {type: String, required: true},
    nombre: {type: String, required: true},
    tipoDocumento: {type: String, required: true},
    numeroDocumento: {type: Number, required: true},
    cuil: Number,
    sexo: {type: String, required: true},
    calle:{type: String, required: true},
    numeroCalle:{type: Number, required: true},
    piso: String,
    departamento: String,
    provincia: {type: String, required: true},
    localidad: {type: String, required: true},
    codigoPostal: Number,
    nacionalidad: String,
    fechaNacimiento: {type: Date, required: true},
    estadoCivil: String,
    telefonoFijo: Number,
    adultoResponsable: [{type: mongoose.Schema.Types.ObjectId, ref: "adultoResponsable"}],
    activo: {type: Boolean, required: true},
    estado: {type: mongoose.Schema.Types.ObjectId, ref: "estado"}
});
module.exports= mongoose.model('estudiante', estudianteSchema, "estudiante");
