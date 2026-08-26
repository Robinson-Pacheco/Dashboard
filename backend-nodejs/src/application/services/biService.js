const AdmissionData = require('../../domain/models/AdmissionData');
const { timeouts } = require('../../config/database');

/**
 * Business Intelligence Service for analyzing admission data
 */
class BIService {
  /**
   * Get admission statistics by period and year
   * @param {string} period - Academic period
   * @param {number} year - Academic year
   * @returns {Promise<Object>} Statistics object
   */
  async getAdmissionStatisticsByPeriod(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const statistics = await AdmissionData.aggregate([
        { $match: matchStage },
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
            totalApplications: { $sum: 1 },
            admitidosCount: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'SI'] }, 1, 0]
              }
            },
            noAdmitidosCount: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'NO'] }, 1, 0]
              }
            },
            averageScore: { $avg: '$totalScore' },
            maxScore: { $max: '$totalScore' },
            minScore: { $min: '$totalScore' }
          }
        }
      ]).option({ maxTimeMS: timeouts.aggregation });

      return statistics[0] || {
        totalApplications: 0,
        admitidosCount: 0,
        noAdmitidosCount: 0,
        averageScore: 0,
        maxScore: 0,
        minScore: 0
      };
    } catch (error) {
      throw new Error(`Error fetching admission statistics: ${error.message}`);
    }
  }

  /**
   * Get admission trends over time
   * @returns {Promise<Array>} Array of trend data
   */
  async getAdmissionTrends() {
    try {
      const trends = await AdmissionData.aggregate([
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
            _id: {
              year: '$year',
              period: '$period',
              usuario_id: '$usuario_id',
              componente: '$componente'
            },
            puntajeNumerico: { $first: '$puntajeNumerico' },
            conCupo: { $first: '$conCupo' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              period: '$_id.period',
              usuario_id: '$_id.usuario_id'
            },
            conCupo: { $first: '$conCupo' },
            totalScore: { $sum: '$puntajeNumerico' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              period: '$_id.period'
            },
            totalApplications: { $sum: 1 },
            admitidosCount: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'SI'] }, 1, 0]
              }
            },
            noAdmitidosCount: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'NO'] }, 1, 0]
              }
            },
            averageScore: { $avg: '$totalScore' }
          }
        },
        { $sort: { '_id.year': 1, '_id.period': 1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      return trends.map(trend => ({
        year: trend._id.year,
        period: trend._id.period,
        totalApplications: trend.totalApplications,
        admitidosCount: trend.admitidosCount,
        noAdmitidosCount: trend.noAdmitidosCount,
        averageScore: trend.averageScore ? trend.averageScore.toFixed(2) : '0.00'
      }));
    } catch (error) {
      throw new Error(`Error fetching admission trends: ${error.message}`);
    }
  }

  /**
   * Get demographic breakdown of applicants
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Demographic data
   */
  async getDemographicBreakdown(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const genderBreakdown = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              usuario_id: '$usuario_id',
              sexo: '$sexo'
            }
          }
        },
        {
          $group: {
            _id: '$_id.sexo',
            count: { $sum: 1 }
          }
        }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const provinceBreakdown = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              usuario_id: '$usuario_id',
              provincia: '$provinciaReside'
            }
          }
        },
        {
          $group: {
            _id: '$_id.provincia',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const educationalUnitBreakdown = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              usuario_id: '$usuario_id',
              tipoUnidad: '$tipoUnidadEducativa'
            }
          }
        },
        {
          $group: {
            _id: '$_id.tipoUnidad',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      return {
        gender: genderBreakdown,
        province: provinceBreakdown,
        educationalUnit: educationalUnitBreakdown
      };
    } catch (error) {
      throw new Error(`Error fetching demographic breakdown: ${error.message}`);
    }
  }

  /**
   * Get performance analysis by component
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Array>} Component performance data
   */
  async getComponentPerformance(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const componentPerformance = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            porcentajeNumerico: { 
              $cond: [
                { $or: [
                  { $eq: ['$porcentaje_componente', null] },
                  { $eq: ['$porcentaje_componente', ''] }
                ]},
                0,
                { $toDouble: '$porcentaje_componente' }
              ]
            },
            puntajeMaxNumerico: { 
              $cond: [
                { $or: [
                  { $eq: ['$puntaje_max_componente', null] },
                  { $eq: ['$puntaje_max_componente', ''] }
                ]},
                0,
                { $toDouble: '$puntaje_max_componente' }
              ]
            }
          }
        },
        {
          $group: {
            _id: { componente: '$componente', usuario_id: '$usuario_id' },
            porcentajeNumerico: { $first: '$porcentajeNumerico' },
            puntajeMaxNumerico: { $first: '$puntajeMaxNumerico' }
          }
        },
        {
          $group: {
            _id: '$_id.componente',
            averageScore: { $avg: '$porcentajeNumerico' },
            maxScore: { $max: '$puntajeMaxNumerico' },
            minScore: { $min: '$porcentajeNumerico' },
            count: { $sum: 1 }
          }
        },
        { $sort: { averageScore: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      return componentPerformance.map(comp => ({
        component: comp._id,
        averageScore: comp.averageScore ? parseFloat(comp.averageScore.toFixed(2)) : 0,
        maxScore: comp.maxScore ? comp.maxScore.toString() : '0',
        minScore: comp.minScore ? parseFloat(comp.minScore.toFixed(2)) : 0,
        applicantCount: comp.count
      }));
    } catch (error) {
      throw new Error(`Error fetching component performance: ${error.message}`);
    }
  }

  /**
   * Get disability statistics
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Disability statistics
   */
  async getDisabilityStatistics(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const studentIdExpr = {
        $cond: [
          { $and: [{ $ne: ['$usuario_id', null] }, { $ne: ['$usuario_id', ''] }] },
          '$usuario_id',
          '$studentId'
        ]
      };

      const invalidValues = ['NO', 'NO TIENE', 'SIN CARNET', 'N/A', 'NINGUNA', '0', 'NONE', ''];

      const disabilityStats = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: studentIdExpr,
            cierreCarnetDiscapacidad: { $first: '$cierreCarnetDiscapacidad' },
            cierreTipoDiscapacidad: { $first: '$cierreTipoDiscapacidad' }
          }
        },
        {
          $group: {
            _id: null,
            totalApplicants: { $sum: 1 },
            withDisabilityCard: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$cierreCarnetDiscapacidad', null] },
                      { $ne: ['$cierreCarnetDiscapacidad', ''] },
                      { $not: [{ $in: [{ $toUpper: { $trim: { input: '$cierreCarnetDiscapacidad' } } }, invalidValues] }] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            withDisabilityType: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$cierreTipoDiscapacidad', null] },
                      { $ne: ['$cierreTipoDiscapacidad', ''] },
                      { $not: [{ $in: [{ $toUpper: { $trim: { input: '$cierreTipoDiscapacidad' } } }, invalidValues] }] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const disabilityTypeBreakdown = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            tipoClean: { $toUpper: { $trim: { input: { $ifNull: ['$cierreTipoDiscapacidad', ''] } } } },
            studentKey: studentIdExpr
          }
        },
        {
          $match: {
            tipoClean: { $nin: invalidValues }
          }
        },
        {
          $group: {
            _id: {
              studentKey: '$studentKey',
              tipo: '$tipoClean'
            }
          }
        },
        {
          $group: {
            _id: '$_id.tipo',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const stats = disabilityStats[0] || {
        totalApplicants: 0,
        withDisabilityCard: 0,
        withDisabilityType: 0
      };

      const breakdownTotal = disabilityTypeBreakdown.reduce((acc, curr) => acc + curr.count, 0);
      const finalWithDisability = Math.max(stats.withDisabilityCard, stats.withDisabilityType, breakdownTotal);

      return {
        totalApplicants: stats.totalApplicants,
        withDisabilityCard: finalWithDisability,
        disabilityPercentage: stats.totalApplicants > 0
          ? ((finalWithDisability / stats.totalApplicants) * 100).toFixed(2)
          : '0.00',
        disabilityTypeBreakdown
      };
    } catch (error) {
      throw new Error(`Error fetching disability statistics: ${error.message}`);
    }
  }

  /**
   * Get available periods and years from admission data
   * @returns {Promise<Object>} Available periods and years
   */
  async getAvailablePeriodsAndYears() {
    try {
      const availableData = await AdmissionData.aggregate([
        {
          $group: {
            _id: null,
            uniquePeriods: { $addToSet: '$period' },
            uniqueYears: { $addToSet: '$year' }
          }
        }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const result = availableData[0] || { uniquePeriods: [], uniqueYears: [] };
      
      return {
        periods: result.uniquePeriods.sort(),
        years: result.uniqueYears.sort((a, b) => b - a) // Most recent years first
      };
    } catch (error) {
      throw new Error(`Error fetching available periods and years: ${error.message}`);
    }
  }

  /**
   * Get comprehensive dashboard data
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData(period, year) {
    try {
      const [statistics, trends, demographics, componentPerformance, disabilityStats] = await Promise.all([
        this.getAdmissionStatisticsByPeriod(period, year),
        this.getAdmissionTrends(),
        this.getDemographicBreakdown(period, year),
        this.getComponentPerformance(period, year),
        this.getDisabilityStatistics(period, year)
      ]);

      return {
        statistics,
        trends,
        demographics,
        componentPerformance,
        disabilityStats
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }

  /**
   * Get executive summary for a period/year
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Executive summary data
   */
  async getExecutiveSummary(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const [statsData, genderDist, careerDemand, provinceData, institutionData] = await Promise.all([
        this.getAdmissionStatisticsByPeriod(period, year),
        this._getGenderDistribution(matchStage),
        this._getMostDemandedCareer(matchStage),
        this._getTopProvince(matchStage),
        this._getBestWorstInstitutions(matchStage)
      ]);

      return {
        totalPostulantes: statsData.totalApplications,
        promedioGeneral: statsData.averageScore,
        distribucionGenero: genderDist,
        carreraMasDemandada: careerDemand,
        provinciaConMasPostulantes: provinceData,
        instituciones: institutionData
      };
    } catch (error) {
      throw new Error(`Error fetching executive summary: ${error.message}`);
    }
  }

  async _getGenderDistribution(matchStage) {
    const data = await AdmissionData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { usuario_id: '$usuario_id', sexo: '$sexo' }
        }
      },
      {
        $group: {
          _id: '$_id.sexo',
          count: { $sum: 1 }
        }
      }
    ]).option({ maxTimeMS: timeouts.aggregation });
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    return data.map(d => ({
      genero: d._id || 'No especificado',
      cantidad: d.count,
      porcentaje: parseFloat(((d.count / total) * 100).toFixed(2))
    }));
  }

  async _getMostDemandedCareer(matchStage) {
    const data = await AdmissionData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { career: '$conCupoCarrera', usuario_id: '$usuario_id' }
        }
      },
      {
        $group: {
          _id: '$_id.career',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $nin: [null, '', 'Sin especificar', 'N/A'] }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).option({ maxTimeMS: timeouts.aggregation });
    return data[0] ? { carrera: data[0]._id, postulantes: data[0].count } : null;
  }

  async _getTopProvince(matchStage) {
    const data = await AdmissionData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { province: '$provinciaReside', usuario_id: '$usuario_id' }
        }
      },
      {
        $group: {
          _id: '$_id.province',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).option({ maxTimeMS: timeouts.aggregation });
    return data[0] ? { provincia: data[0]._id, postulantes: data[0].count } : null;
  }

  async _getBestWorstInstitutions(matchStage) {
    const data = await AdmissionData.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          puntajeNumerico: {
            $cond: [
              { $or: [{ $eq: ['$puntaje_obtenido_componente', null] }, { $eq: ['$puntaje_obtenido_componente', ''] }] },
              0,
              { $toDouble: '$puntaje_obtenido_componente' }
            ]
          }
        }
      },
      {
        $group: {
          _id: { inst: '$unidadEducativa', usuario_id: '$usuario_id', componente: '$componente' },
          puntajeNumerico: { $first: '$puntajeNumerico' }
        }
      },
      {
        $group: {
          _id: { inst: '$_id.inst', usuario_id: '$_id.usuario_id' },
          totalScore: { $sum: '$puntajeNumerico' }
        }
      },
      {
        $group: {
          _id: '$_id.inst',
          avgScore: { $avg: '$totalScore' },
          studentCount: { $sum: 1 }
        }
      },
      { $match: { studentCount: { $gte: 3 } } },
      { $sort: { avgScore: -1 } }
    ]).option({ maxTimeMS: timeouts.aggregation });

    const best = data.length > 0 ? { nombre: data[0]._id, promedio: parseFloat(data[0].avgScore.toFixed(2)), estudiantes: data[0].studentCount } : null;
    const worst = data.length > 0 ? { nombre: data[data.length - 1]._id, promedio: parseFloat(data[data.length - 1].avgScore.toFixed(2)), estudiantes: data[data.length - 1].studentCount } : null;

    return { mejorRendimiento: best, menorRendimiento: worst };
  }

  /**
   * Get filtered data with cross-variable filters
   * @param {Object} filters - { period, year, provincia, canton, sexo, tipoInstitucion, carrera }
   * @returns {Promise<Object>} Filtered statistics
   */
  async getFilteredData(filters = {}) {
    try {
      const matchStage = {};
      if (filters.period) matchStage.period = filters.period;
      if (filters.year) matchStage.year = parseInt(filters.year);
      if (filters.provincia) matchStage.provinciaReside = filters.provincia;
      if (filters.canton) matchStage.cantonReside = filters.canton;
      if (filters.sexo) matchStage.sexo = filters.sexo;
      if (filters.tipoInstitucion) matchStage.tipoUnidadEducativa = filters.tipoInstitucion;
      if (filters.carrera) matchStage.conCupoCarrera = filters.carrera;

      const [stats, genderDist, topCareers, topProvinces, institutionTypes] = await Promise.all([
        this.getAdmissionStatisticsByPeriod(filters.period, filters.year),
        this._getGenderDistribution(matchStage),
        this._getCareerRanking(matchStage),
        this._getProvinceRanking(matchStage),
        this._getInstitutionTypeBreakdown(matchStage)
      ]);

      return { statistics: stats, distribucionGenero: genderDist, carrerasPopulares: topCareers, provincias: topProvinces, tiposInstitucion: institutionTypes };
    } catch (error) {
      throw new Error(`Error fetching filtered data: ${error.message}`);
    }
  }

  async _getCareerRanking(matchStage) {
    return await AdmissionData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { career: '$conCupoCarrera', usuario_id: '$usuario_id' }
        }
      },
      {
        $group: {
          _id: '$_id.career',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]).option({ maxTimeMS: timeouts.aggregation }).then(data =>
      data.filter(d => d._id && d._id !== 'Sin especificar').map(d => ({ carrera: d._id, postulantes: d.count }))
    );
  }

  async _getProvinceRanking(matchStage) {
    return await AdmissionData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { provincia: '$provinciaReside', usuario_id: '$usuario_id' }
        }
      },
      {
        $group: {
          _id: '$_id.provincia',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).option({ maxTimeMS: timeouts.aggregation }).then(data =>
      data.filter(d => d._id).map(d => ({ provincia: d._id, postulantes: d.count }))
    );
  }

  async _getInstitutionTypeBreakdown(matchStage) {
    return await AdmissionData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { tipo: '$tipoUnidadEducativa', usuario_id: '$usuario_id' }
        }
      },
      {
        $group: {
          _id: '$_id.tipo',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).option({ maxTimeMS: timeouts.aggregation }).then(data =>
      data.filter(d => d._id).map(d => ({ tipo: d._id, estudiantes: d.count }))
    );
  }

  /**
   * Get careers breakdown by gender (hombres vs mujeres)
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Careers by gender data
   */
  async getCareersByGender(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const careerGenderStats = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            sexoClean: { $toUpper: { $trim: { input: { $ifNull: ['$sexo', ''] } } } },
            carreraClean: { $trim: { input: { $ifNull: ['$conCupoCarrera', ''] } } },
            puntajeNumerico: {
              $cond: [
                { $or: [{ $eq: ['$puntaje_obtenido_componente', null] }, { $eq: ['$puntaje_obtenido_componente', ''] }] },
                0,
                { $toDouble: '$puntaje_obtenido_componente' }
              ]
            },
            studentKey: {
              $cond: [
                { $and: [{ $ne: ['$usuario_id', null] }, { $ne: ['$usuario_id', ''] }] },
                '$usuario_id',
                { $ifNull: ['$studentId', { $toString: '$_id' }] }
              ]
            }
          }
        },
        {
          $match: {
            carreraClean: { $nin: [null, '', 'Sin especificar', 'N/A', 'NO APLICA'] },
            sexoClean: { $nin: ['', 'NO ESPECIFICADO', 'N/A', 'NULL', 'UNDEFINED'] }
          }
        },
        {
          $group: {
            _id: { studentKey: '$studentKey', carrera: '$carreraClean', sexo: '$sexoClean' },
            totalScore: { $sum: '$puntajeNumerico' }
          }
        },
        {
          $group: {
            _id: { carrera: '$_id.carrera', sexo: '$_id.sexo' },
            count: { $sum: 1 },
            avgScore: { $avg: '$totalScore' },
            maxScore: { $max: '$totalScore' },
            minScore: { $min: '$totalScore' }
          }
        },
        { $sort: { count: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      // Normalize to canonical gender
      const normalized = careerGenderStats.map(item => {
        const raw = item._id.sexo;
        let canon = raw;
        if (['MASCULINO', 'HOMBRE', 'M', 'MASC', 'MASCULINA'].includes(raw)) canon = 'MASCULINO';
        else if (['FEMENINO', 'MUJER', 'F', 'FEM', 'FEMENINA'].includes(raw)) canon = 'FEMENINO';
        return { 
          carrera: item._id.carrera, 
          sexo: canon, 
          rawSexo: raw, 
          count: item.count,
          avgScore: item.avgScore ? parseFloat(item.avgScore.toFixed(1)) : 0,
          maxScore: item.maxScore ? parseFloat(item.maxScore.toFixed(1)) : 0,
          minScore: item.minScore ? parseFloat(item.minScore.toFixed(1)) : 0
        };
      });

      const carreraMap = {};
      normalized.forEach(r => {
        if (!carreraMap[r.carrera]) carreraMap[r.carrera] = { carrera: r.carrera, masculino: 0, femenino: 0, otros: 0, total: 0, sumScoreMasc: 0, sumScoreFem: 0, countMasc: 0, countFem: 0, maxMasc: 0, maxFem: 0, minMasc: 9999, minFem: 9999 };
        if (r.sexo === 'MASCULINO') {
          carreraMap[r.carrera].masculino += r.count;
          carreraMap[r.carrera].sumScoreMasc += r.avgScore * r.count;
          carreraMap[r.carrera].countMasc += r.count;
          carreraMap[r.carrera].maxMasc = Math.max(carreraMap[r.carrera].maxMasc, r.maxScore);
          carreraMap[r.carrera].minMasc = Math.min(carreraMap[r.carrera].minMasc, r.minScore);
        } else if (r.sexo === 'FEMENINO') {
          carreraMap[r.carrera].femenino += r.count;
          carreraMap[r.carrera].sumScoreFem += r.avgScore * r.count;
          carreraMap[r.carrera].countFem += r.count;
          carreraMap[r.carrera].maxFem = Math.max(carreraMap[r.carrera].maxFem, r.maxScore);
          carreraMap[r.carrera].minFem = Math.min(carreraMap[r.carrera].minFem, r.minScore);
        } else {
          carreraMap[r.carrera].otros += r.count;
        }
        carreraMap[r.carrera].total += r.count;
      });

      const resumen = Object.values(carreraMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 12)
        .map(c => {
          const avgMasc = c.countMasc ? (c.sumScoreMasc / c.countMasc) : 0;
          const avgFem = c.countFem ? (c.sumScoreFem / c.countFem) : 0;
          const avgTotal = (c.sumScoreMasc + c.sumScoreFem) / (c.countMasc + c.countFem || 1);
          return {
            carrera: c.carrera,
            masculino: c.masculino,
            femenino: c.femenino,
            otros: c.otros,
            total: c.total,
            pctMasculino: c.total ? ((c.masculino / c.total) * 100).toFixed(1) : '0.0',
            pctFemenino: c.total ? ((c.femenino / c.total) * 100).toFixed(1) : '0.0',
            dominante: c.masculino > c.femenino ? 'MASCULINO' : c.femenino > c.masculino ? 'FEMENINO' : 'PARIDAD',
            brecha: Math.abs(c.masculino - c.femenino),
            avgMasculino: parseFloat(avgMasc.toFixed(1)),
            avgFemenino: parseFloat(avgFem.toFixed(1)),
            avgTotal: parseFloat(avgTotal.toFixed(1)),
            maxMasculino: c.maxMasc || 0,
            maxFemenino: c.maxFem || 0,
            minMasculino: c.minMasc === 9999 ? 0 : c.minMasc,
            minFemenino: c.minFem === 9999 ? 0 : c.minFem,
            diffAvg: parseFloat((avgMasc - avgFem).toFixed(1))
          };
        });

      const topMasculino = Object.values(carreraMap)
        .filter(c => c.masculino > 0)
        .sort((a, b) => b.masculino - a.masculino)
        .slice(0, 6)
        .map(c => {
          const avg = c.countMasc ? (c.sumScoreMasc / c.countMasc) : 0;
          return { carrera: c.carrera, count: c.masculino, pct: c.total ? ((c.masculino / c.total) * 100).toFixed(1) : '0', avg: parseFloat(avg.toFixed(1)) };
        });

      const topFemenino = Object.values(carreraMap)
        .filter(c => c.femenino > 0)
        .sort((a, b) => b.femenino - a.femenino)
        .slice(0, 6)
        .map(c => {
          const avg = c.countFem ? (c.sumScoreFem / c.countFem) : 0;
          return { carrera: c.carrera, count: c.femenino, pct: c.total ? ((c.femenino / c.total) * 100).toFixed(1) : '0', avg: parseFloat(avg.toFixed(1)) };
        });

      // Find most gendered careers (highest brecha %)
      const mostGendered = [...resumen]
        .filter(r => r.total >= 5)
        .sort((a, b) => Math.abs(parseFloat(b.pctMasculino) - 50) - Math.abs(parseFloat(a.pctMasculino) - 50))
        .slice(0, 3);

      return {
        byCareerGender: normalized,
        resumen,
        topMasculino,
        topFemenino,
        mostGendered
      };
    } catch (error) {
      throw new Error(`Error fetching careers by gender: ${error.message}`);
    }
  }

  /**
   * Get cupos (admitidos) por carrera y género — quién obtuvo más cupos
   */
  async getCareerCuposByGender(period, year) {
    try {
      const matchStage = { conCupo: 'SI' };
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const cuposByGender = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            sexoClean: { $toUpper: { $trim: { input: { $ifNull: ['$sexo', ''] } } } },
            carreraClean: { $trim: { input: { $ifNull: ['$conCupoCarrera', ''] } } },
            studentKey: {
              $cond: [
                { $and: [{ $ne: ['$usuario_id', null] }, { $ne: ['$usuario_id', ''] }] },
                '$usuario_id',
                { $ifNull: ['$studentId', { $toString: '$_id' }] }
              ]
            }
          }
        },
        {
          $match: {
            carreraClean: { $nin: [null, '', 'Sin especificar', 'N/A', 'NO APLICA'] },
            sexoClean: { $nin: ['', 'NO ESPECIFICADO', 'N/A', 'NULL', 'UNDEFINED'] }
          }
        },
        {
          $group: {
            _id: { studentKey: '$studentKey', carrera: '$carreraClean', sexo: '$sexoClean' }
          }
        },
        {
          $group: {
            _id: { carrera: '$_id.carrera', sexo: '$_id.sexo' },
            cupos: { $sum: 1 }
          }
        },
        { $sort: { cupos: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const normalized = cuposByGender.map(item => {
        const raw = item._id.sexo;
        let canon = raw;
        if (['MASCULINO', 'HOMBRE', 'M', 'MASC', 'MASCULINA'].includes(raw)) canon = 'MASCULINO';
        else if (['FEMENINO', 'MUJER', 'F', 'FEM', 'FEMENINA'].includes(raw)) canon = 'FEMENINO';
        return { carrera: item._id.carrera, sexo: canon, rawSexo: raw, cupos: item.cupos };
      });

      const map = {};
      normalized.forEach(r => {
        if (!map[r.carrera]) map[r.carrera] = { carrera: r.carrera, masculino: 0, femenino: 0, otros: 0, total: 0 };
        if (r.sexo === 'MASCULINO') map[r.carrera].masculino += r.cupos;
        else if (r.sexo === 'FEMENINO') map[r.carrera].femenino += r.cupos;
        else map[r.carrera].otros += r.cupos;
        map[r.carrera].total += r.cupos;
      });

      const resumen = Object.values(map)
        .sort((a, b) => b.total - a.total)
        .map(c => ({
          ...c,
          pctMasculino: c.total ? ((c.masculino / c.total) * 100).toFixed(1) : '0.0',
          pctFemenino: c.total ? ((c.femenino / c.total) * 100).toFixed(1) : '0.0',
          dominante: c.masculino > c.femenino ? 'MASCULINO' : c.femenino > c.masculino ? 'FEMENINO' : 'PARIDAD',
          brecha: Math.abs(c.masculino - c.femenino)
        }));

      const totalCuposMasc = Object.values(map).reduce((s, c) => s + c.masculino, 0);
      const totalCuposFem = Object.values(map).reduce((s, c) => s + c.femenino, 0);
      const totalCupos = totalCuposMasc + totalCuposFem;

      return {
        byCareerGenderCupos: normalized,
        resumen,
        totales: { masculino: totalCuposMasc, femenino: totalCuposFem, total: totalCupos, pctMasc: totalCupos ? ((totalCuposMasc / totalCupos) * 100).toFixed(1) : '0.0', pctFem: totalCupos ? ((totalCuposFem / totalCupos) * 100).toFixed(1) : '0.0' }
      };
    } catch (error) {
      throw new Error(`Error fetching career cupos by gender: ${error.message}`);
    }
  }
}

module.exports = new BIService();
