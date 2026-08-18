const mongoose = require('mongoose');

const AdmissionDataSchema = new mongoose.Schema({
  // Student identification
  studentId: {
    type: String,
    required: [true, 'Please provide the student ID'],
    trim: true,
    default: function() {
      // Generate a temporary ID if not provided
      return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  },
  studentName: {
    type: String,
    required: [true, 'Please provide the student name'],
    trim: true,
    default: 'Unknown Student'
  },
  
  // Personal information from Excel
  sexo: {
    type: String,
    trim: true
  },
  paisReside: {
    type: String,
    trim: true
  },
  provinciaReside: {
    type: String,
    trim: true
  },
  cantonReside: {
    type: String,
    trim: true
  },
  unidadEducativa: {
    type: String,
    trim: true
  },
  tipoUnidadEducativa: {
    type: String,
    trim: true
  },
  
  // Disability information
  cierreCarnetDiscapacidad: {
    type: String,
    trim: true
  },
  cierreTipoDiscapacidad: {
    type: String,
    trim: true
  },
  cierrePrcjDiscapacidad: {
    type: String,
    trim: true
  },
  
  // Admission information
  conCupo: {
    type: String,
    trim: true
  },
  conCupoCarrera: {
    type: String,
    trim: true
  },
  
  // Test information
  nro: {
    type: String,
    trim: true
  },
  course_id: {
    type: String,
    trim: true
  },
  curso: {
    type: String,
    trim: true
  },
  quiz_id: {
    type: String,
    trim: true
  },
  quiz: {
    type: String,
    trim: true
  },
  usuario_id: {
    type: String,
    trim: true
  },
  
  // Component information
  categoria_id: {
    type: String,
    trim: true
  },
  componente: {
    type: String,
    trim: true
  },
  nro_preguntas: {
    type: String,
    trim: true
  },
  preguntas_correctas: {
    type: String,
    trim: true
  },
  preguntas_incorrectas: {
    type: String,
    trim: true
  },
  preguntas_no_contestadas: {
    type: String,
    trim: true
  },
  puntaje_max_componente: {
    type: String,
    trim: true
  },
  puntaje_obtenido_componente: {
    type: String,
    trim: true
  },
  porcentaje_componente: {
    type: String,
    trim: true
  },
  fecha_termino_intento: {
    type: String,
    trim: true
  },
  
  // System fields
  period: {
    type: String,
    required: [true, 'Please provide the admission period'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide the year']
  },
  scores: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  totalScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  originalFileName: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Index for efficient querying
AdmissionDataSchema.index({ period: 1, year: 1 });
AdmissionDataSchema.index({ studentId: 1 });
AdmissionDataSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('AdmissionData', AdmissionDataSchema);