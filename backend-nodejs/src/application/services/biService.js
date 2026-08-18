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
      { $limit: 10 }
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
}

module.exports = new BIService();
