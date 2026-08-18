const AdmissionData = require('../../domain/models/AdmissionData');
const ExcelJS = require('exceljs');
const fs = require('fs');

const getUploadHistory = async (userId) => {
  return await AdmissionData.aggregate([
    { $match: { uploadedBy: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
    {
      $group: {
        _id: {
          period: '$period',
          year: '$year',
          originalFileName: '$originalFileName',
          uploadedAt: '$uploadedAt'
        },
        recordCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        period: '$_id.period',
        originalFileName: '$_id.originalFileName',
        uploadedAt: '$_id.uploadedAt',
        recordCount: 1
      }
    },
    { $sort: { uploadedAt: -1 } }
  ]);
};

const processAdmissionData = async (filePath, period, year, userId, originalFileName) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    // Get headers from first row - use values array for proper indexing
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values; // Array with index starting at 1

    // Helper function to get cell value as text/number (handles dates, formulas, etc)
    const getCellValue = (value) => {
      // Handle null/undefined
      if (value === null || value === undefined) return '';

      // Handle Date objects - ExcelJS returns native Date objects
      if (value instanceof Date) {
        // Return Excel serial date number (days since 1/1/1900)
        const excelEpoch = new Date(1900, 0, 1);
        const diffTime = value.getTime() - excelEpoch.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return String(Math.floor(diffDays + 2)); // +2 because Excel starts at day 1
      }

      // Handle objects with type property (ExcelJS specific types)
      if (typeof value === 'object') {
        // Formula
        if (value.type === 'formula') {
          return value.result !== undefined ? String(value.result) : '';
        }
        // Hyperlink
        if (value.type === 'hyperlink') {
          return value.text !== undefined ? value.text : (value.href || '');
        }
        // Rich text or other objects with text/result/value
        if (value.text !== undefined) return value.text;
        if (value.result !== undefined) return String(value.result);
        if (value.value !== undefined) return value.value;
      }

      // Handle simple values (string, number, boolean)
      return String(value);
    };

    // Convert worksheet to JSON
    const jsonData = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      const rowData = {};
      const values = row.values; // Array with index starting at 1

      // Map values to headers
      for (let i = 1; i < values.length; i++) {
        const header = headers[i];
        if (header) {
          rowData[header] = getCellValue(values[i]);
        }
      }
      jsonData.push(rowData);
    });
    
    const admissionRecords = jsonData.map((row, index) => {
      const studentId = row['nro'] ? `STU_${row['nro']}` : 
                      row['usuario_id'] ? `USER_${row['usuario_id']}` : 
                      `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const studentName = row['unidadEducativa'] || 
                         row['conCupoCarrera'] || 
                         `Student_${row['nro'] || 'Unknown'}`;
      
      const scores = {};
      
      if (row['puntaje_obtenido_componente'] && !isNaN(parseFloat(row['puntaje_obtenido_componente']))) {
        scores[row['componente'] || 'component'] = parseFloat(row['puntaje_obtenido_componente']);
      }
      
      if (row['porcentaje_componente'] && !isNaN(parseFloat(row['porcentaje_componente']))) {
        scores[`${row['componente'] || 'component'}_percentage`] = parseFloat(row['porcentaje_componente']);
      }
      
      const totalScore = parseFloat(row['puntaje_obtenido_componente']) || 0;
      
      const admissionData = {
        studentId,
        studentName,
        sexo: row['sexo'] || '',
        paisReside: row['paisReside'] || '',
        provinciaReside: row['provinciaReside'] || '',
        cantonReside: row['cantonReside'] || '',
        unidadEducativa: row['unidadEducativa'] || '',
        tipoUnidadEducativa: row['tipoUnidadEducativa'] || '',
        cierreCarnetDiscapacidad: row['cierreCarnetDiscapacidad'] || '',
        cierreTipoDiscapacidad: row['cierreTipoDiscapacidad'] || '',
        cierrePrcjDiscapacidad: row['cierrePrcjDiscapacidad'] || '',
        conCupo: row['conCupo'] || '',
        conCupoCarrera: row['conCupoCarrera'] || '',
        nro: row['nro'] || '',
        course_id: row['course_id'] || '',
        curso: row['curso'] || '',
        quiz_id: row['quiz_id'] || '',
        quiz: row['quiz'] || '',
        usuario_id: row['usuario_id'] || '',
        categoria_id: row['categoria_id'] || '',
        componente: row['componente'] || '',
        nro_preguntas: row['nro_preguntas'] || '',
        preguntas_correctas: row['preguntas_correctas'] || '',
        preguntas_incorrectas: row['preguntas_incorrectas'] || '',
        preguntas_no_contestadas: row['preguntas_no_contestadas'] || '',
        puntaje_max_componente: row['puntaje_max_componente'] || '',
        puntaje_obtenido_componente: row['puntaje_obtenido_componente'] || '',
        porcentaje_componente: row['porcentaje_componente'] || '',
        fecha_termino_intento: row['fecha_termino_intento'] || '',
        period,
        year,
        scores,
        totalScore,
        originalFileName: originalFileName || filePath.split('\\').pop() || filePath.split('/').pop(),
        uploadedBy: userId
      };
      
      return admissionData;
    });
    
    const savedRecords = await AdmissionData.insertMany(admissionRecords);
    fs.unlinkSync(filePath);
    
    return {
      success: true,
      count: savedRecords.length,
      message: `Successfully processed ${savedRecords.length} admission records`
    };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Error processing admission data: ${error.message}`);
  }
};

const getAdmissionData = async (filters) => {
  const { period, year, page = 1, limit = 20 } = filters;
  const query = {};
  
  if (period) query.period = period;
  if (year) query.year = year;
  
  const admissionData = await AdmissionData.find(query)
    .populate('uploadedBy', 'username names')
    .sort({ uploadedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await AdmissionData.countDocuments(query);
  
  return {
    admissionData,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalRecords: count
  };
};

const getAdmissionStatistics = async (filters) => {
  const { period, year } = filters;
  const query = {};
  
  if (period) query.period = period;
  if (year) query.year = year;
  
  const stats = await AdmissionData.aggregate([
    { $match: query },
    {
      $addFields: {
        puntajeNumerico: {
          $cond: [
            { $or: [
              { $eq: ['$puntaje_obtenido_componente', null] },
              { $eq: ['$puntaje_obtenido_componente', ''] }
            ]},
            0,
            { $toDouble: '$puntaje_obtenido_componente' }
          ]
        }
      }
    },
    {
      $group: {
        _id: { usuario_id: '$usuario_id', componente: '$componente' },
        puntajeNumerico: { $first: '$puntajeNumerico' },
        conCupo: { $first: '$conCupo' }
      }
    },
    {
      $group: {
        _id: '$_id.usuario_id',
        conCupo: { $first: '$conCupo' },
        totalScore: { $sum: '$puntajeNumerico' }
      }
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        averageScore: { $avg: '$totalScore' },
        maxScore: { $max: '$totalScore' },
        minScore: { $min: '$totalScore' },
        admitidosCount: {
          $sum: {
            $cond: [{ $eq: ['$conCupo', 'SI'] }, 1, 0]
          }
        },
        noAdmitidosCount: {
          $sum: {
            $cond: [{ $eq: ['$conCupo', 'NO'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalStudents: 0,
    averageScore: 0,
    maxScore: 0,
    minScore: 0,
    admitidosCount: 0,
    noAdmitidosCount: 0
  };
};

module.exports = {
  processAdmissionData,
  getAdmissionData,
  getAdmissionStatistics
};