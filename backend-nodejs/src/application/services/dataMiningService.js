const AdmissionData = require('../../domain/models/AdmissionData');
const { timeouts } = require('../../config/database');

/**
 * Data Mining Service for generating insights and recommendations
 */
class DataMiningService {
  /**
   * Get component performance analysis with recommendations (including box plot data)
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Component analysis with recommendations
   */
  async getComponentPerformanceAnalysis(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      // Get all raw component data for quartile calculation
      const rawData = await AdmissionData.aggregate([
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
            }
          }
        },
        {
          $group: {
            _id: '$componente',
            scores: { $push: '$porcentajeNumerico' },
            avgPerformance: { $avg: '$porcentajeNumerico' },
            totalAttempts: { $sum: 1 }
          }
        }
      ]).option({ maxTimeMS: timeouts.aggregation });

      // Calculate box plot statistics for each component
      const componentStats = rawData.map(comp => {
        const scores = comp.scores.sort((a, b) => a - b);
        const stats = this._calculateBoxPlotStats(scores);

        return {
          component: comp._id,
          avgPerformance: comp.avgPerformance,
          totalAttempts: comp.totalAttempts,
          ...stats
        };
      });

      // Sort by average performance
      componentStats.sort((a, b) => a.avgPerformance - b.avgPerformance);

      // Calculate overall average
      const overallAvg = componentStats.length > 0
        ? componentStats.reduce((sum, comp) => sum + comp.avgPerformance, 0) / componentStats.length
        : 0;

      // Generate recommendations with box plot data
      const recommendations = componentStats.map(comp => {
        const performanceLevel = this._getPerformanceLevel(comp.avgPerformance);
        const variability = this._getVariabilityLevel(comp.stdDev);

        return {
          component: comp.component,
          avgPerformance: parseFloat(comp.avgPerformance.toFixed(2)),
          minPerformance: parseFloat(comp.min.toFixed(2)),
          q1: parseFloat(comp.q1.toFixed(2)),
          median: parseFloat(comp.q2.toFixed(2)),
          q3: parseFloat(comp.q3.toFixed(2)),
          maxPerformance: parseFloat(comp.max.toFixed(2)),
          stdDev: parseFloat(comp.stdDev.toFixed(2)),
          totalAttempts: comp.totalAttempts,
          performanceLevel: performanceLevel.level,
          variability: variability.level,
          outliers: comp.outliers,
          recommendations: this._generateComponentRecommendations(comp, overallAvg, performanceLevel, variability)
        };
      });

      return {
        overallAverage: parseFloat(overallAvg.toFixed(2)),
        components: recommendations,
        summary: this._generateOverallComponentSummary(recommendations)
      };
    } catch (error) {
      throw new Error(`Error analyzing component performance: ${error.message}`);
    }
  }

  /**
   * Calculate box plot statistics (min, Q1, Q2, Q3, max, outliers)
   * @param {Array<number>} scores - Sorted array of scores
   * @returns {Object} Box plot statistics
   */
  _calculateBoxPlotStats(scores) {
    if (scores.length === 0) {
      return { min: 0, q1: 0, q2: 0, q3: 0, max: 0, stdDev: 0, outliers: [] };
    }

    const n = scores.length;
    const min = scores[0];
    const max = scores[n - 1];

    // Calculate mean
    const mean = scores.reduce((sum, val) => sum + val, 0) / n;

    // Calculate standard deviation
    const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Calculate quartiles using linear interpolation method
    const getQuantile = (q) => {
      const pos = (n - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;

      if (base >= n - 1) return scores[n - 1];
      return scores[base] + rest * (scores[base + 1] - scores[base]);
    };

    const q1 = getQuantile(0.25);
    const q2 = getQuantile(0.50); // Median
    const q3 = getQuantile(0.75);

    // Calculate IQR and identify outliers
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    const outliers = scores.filter(s => s < lowerFence || s > upperFence);

    return {
      min: Math.max(min, lowerFence), // For whisker display
      q1,
      q2,
      q3,
      max: Math.min(max, upperFence), // For whisker display
      stdDev,
      outliers
    };
  }

  /**
   * Get performance by educational institution with recommendations
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @param {string} sampleSize - Filter by sample size: "1-10", "11-20", "21-50", "50+" (optional)
   * @returns {Promise<Object>} Institution analysis with recommendations
   */
  async getInstitutionPerformanceAnalysis(period, year, sampleSize = null) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      // Debug: Verificar cuántos registros totales hay
      const totalRecords = await AdmissionData.countDocuments(matchStage);
      console.log(`[Institution Analysis] Total records found: ${totalRecords}`);

      // Debug: Verificar cuántos usuarios únicos hay
      const uniqueUsers = await AdmissionData.distinct('usuario_id', matchStage);
      console.log(`[Institution Analysis] Unique students (usuario_id): ${uniqueUsers.length}`);

      const institutionStats = await AdmissionData.aggregate([
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
            _id: {
              institution: '$unidadEducativa',
              type: '$tipoUnidadEducativa',
              usuario_id: '$usuario_id'
            },
            totalScore: { $sum: '$puntajeNumerico' }
          }
        },
        {
          $group: {
            _id: {
              institution: '$_id.institution',
              type: '$_id.type'
            },
            avgScore: { $avg: '$totalScore' },
            minScore: { $min: '$totalScore' },
            maxScore: { $max: '$totalScore' },
            studentCount: { $sum: 1 },
            stdDev: { $stdDevPop: '$totalScore' },
            allScores: { $push: '$totalScore' },
            studentIds: { $addToSet: '$_id.usuario_id' }
          }
        },
        {
          $addFields: {
            uniqueStudentCount: { $size: '$studentIds' }
          }
        },
        { $sort: { avgScore: 1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      // Filter by sample size if provided
      let filteredStats = institutionStats;
      if (sampleSize) {
        filteredStats = institutionStats.filter(inst => {
          const count = inst.uniqueStudentCount || inst.studentCount;
          switch (sampleSize) {
            case '1-10':
              return count >= 1 && count <= 10;
            case '11-20':
              return count >= 11 && count <= 20;
            case '21-50':
              return count >= 21 && count <= 50;
            case '50+':
              return count > 50;
            default:
              return true;
          }
        });
        console.log(`[Institution Analysis] Filtered by sampleSize "${sampleSize}": ${filteredStats.length} institutions`);
      }

      // Debug: Log de las primeras 5 instituciones
      console.log(`[Institution Analysis] Total institutions found: ${filteredStats.length}`);
      if (filteredStats.length > 0) {
        console.log(`[Institution Analysis] Sample (first 5):`);
        filteredStats.slice(0, 5).forEach(inst => {
          console.log(`  - ${inst._id.institution}: ${inst.studentCount} records, ${inst.uniqueStudentCount} unique students`);
        });
      }

      // Calcular promedio general de TODAS las instituciones
      const overallAvg = filteredStats.length > 0
        ? filteredStats.reduce((sum, inst) => sum + inst.avgScore, 0) / filteredStats.length
        : 0;

      // Limitar a top 50 con menor rendimiento DESPUÉS de calcular el promedio general
      const top50Institutions = filteredStats.slice(0, 50);

      const recommendations = top50Institutions.map(inst => {
        const performanceLevel = this._getScorePerformanceLevel(inst.avgScore);

        return {
          institution: inst._id.institution || 'Sin información',
          type: inst._id.type || 'No especificado',
          avgScore: parseFloat(inst.avgScore.toFixed(2)),
          minScore: parseFloat(inst.minScore.toFixed(2)),
          maxScore: parseFloat(inst.maxScore.toFixed(2)),
          studentCount: inst.uniqueStudentCount || inst.studentCount,
          stdDev: parseFloat(inst.stdDev.toFixed(2)),
          performanceLevel: performanceLevel.level,
          recommendations: this._generateInstitutionRecommendations(inst, overallAvg, performanceLevel, inst.uniqueStudentCount || inst.studentCount)
        };
      });

      // Group by institution type for analysis
      const groupByType = filteredStats.reduce((acc, inst) => {
        const type = inst._id.type || 'No especificado';
        if (!acc[type]) {
          acc[type] = {
            type,
            institutions: [],
            totalStudents: 0,
            avgScore: 0,
            totalScore: 0
          };
        }
        acc[type].institutions.push({
          institution: inst._id.institution || 'Sin información',
          avgScore: parseFloat(inst.avgScore.toFixed(2)),
          studentCount: inst.uniqueStudentCount || inst.studentCount
        });
        acc[type].totalStudents += (inst.uniqueStudentCount || inst.studentCount);
        acc[type].totalScore += inst.avgScore;
        return acc;
      }, {});

      // Calculate averages for each type
      Object.values(groupByType).forEach(group => {
        group.avgScore = group.totalScore / group.institutions.length;
        group.avgScoreFormatted = parseFloat(group.avgScore.toFixed(2));
      });

      // Analyze risk concentration by sector (public vs private)
      const publicSector = ['Fiscal', 'Municipal'];
      const privateSector = ['Particular', 'Fiscomisional'];

      const publicInstitutions = filteredStats.filter(inst =>
        publicSector.includes(inst._id.type)
      );
      const privateInstitutions = filteredStats.filter(inst =>
        privateSector.includes(inst._id.type)
      );

      const publicAvg = publicInstitutions.length > 0
        ? publicInstitutions.reduce((sum, inst) => sum + inst.avgScore, 0) / publicInstitutions.length
        : 0;
      const privateAvg = privateInstitutions.length > 0
        ? privateInstitutions.reduce((sum, inst) => sum + inst.avgScore, 0) / privateInstitutions.length
        : 0;

      const riskConcentration = {
        public: {
          count: publicInstitutions.length,
          avgScore: parseFloat(publicAvg.toFixed(2)),
          riskLevel: this._getSectorRiskLevel(publicAvg, overallAvg)
        },
        private: {
          count: privateInstitutions.length,
          avgScore: parseFloat(privateAvg.toFixed(2)),
          riskLevel: this._getSectorRiskLevel(privateAvg, overallAvg)
        },
        gap: parseFloat(Math.abs(publicAvg - privateAvg).toFixed(2)),
        dominantSector: publicAvg < privateAvg ? 'Público' : (privateAvg < publicAvg ? 'Privado' : 'Equilibrado')
      };

      return {
        overallAverage: parseFloat(overallAvg.toFixed(2)),
        institutions: recommendations,
        groupByType: Object.values(groupByType),
        riskConcentration,
        summary: this._generateInstitutionSummary(recommendations)
      };
    } catch (error) {
      throw new Error(`Error analyzing institution performance: ${error.message}`);
    }
  }

  /**
   * Get performance by geographic location (Risk Index by Origin - IRP)
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @param {string} sampleSize - Filter by sample size: "1-10", "11-20", "21-50", "50+" (optional)
   * @returns {Promise<Object>} Geographic analysis with recommendations
   */
  async getGeographicPerformanceAnalysis(period, year, sampleSize = null) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      console.log(`[Geographic Analysis] Starting analysis with sampleSize filter: "${sampleSize || 'none'}"`);
      const totalRecords = await AdmissionData.countDocuments(matchStage);
      console.log(`[Geographic Analysis] Total records found: ${totalRecords}`);

      const geoStats = await AdmissionData.aggregate([
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
            _id: {
              province: '$provinciaReside',
              canton: '$cantonReside',
              usuario_id: '$usuario_id'
            },
            totalScore: { $sum: '$puntajeNumerico' }
          }
        },
        {
          $group: {
            _id: {
              province: '$_id.province',
              canton: '$_id.canton'
            },
            avgScore: { $avg: '$totalScore' },
            minScore: { $min: '$totalScore' },
            maxScore: { $max: '$totalScore' },
            studentCount: { $sum: 1 },
            stdDev: { $stdDevPop: '$totalScore' },
            studentIds: { $addToSet: '$_id.usuario_id' }
          }
        },
        {
          $addFields: {
            uniqueStudentCount: { $size: '$studentIds' }
          }
        },
        { $sort: { avgScore: 1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      console.log(`[Geographic Analysis] Total locations found before filtering: ${geoStats.length}`);

      // Filter by sample size if provided
      let filteredStats = geoStats;
      if (sampleSize) {
        filteredStats = geoStats.filter(geo => {
          const count = geo.uniqueStudentCount || geo.studentCount;
          switch (sampleSize) {
            case '1-10':
              return count >= 1 && count <= 10;
            case '11-20':
              return count >= 11 && count <= 20;
            case '21-50':
              return count >= 21 && count <= 50;
            case '50+':
              return count > 50;
            default:
              return true;
          }
        });
        console.log(`[Geographic Analysis] Filtered by sampleSize "${sampleSize}": ${filteredStats.length} locations`);
      }

      // Debug: Log first 5 locations
      if (filteredStats.length > 0) {
        console.log(`[Geographic Analysis] Sample (first 5):`);
        filteredStats.slice(0, 5).forEach(geo => {
          console.log(`  - ${geo._id.province}, ${geo._id.canton}: ${geo.studentCount} records, ${geo.uniqueStudentCount} unique students`);
        });
      }

      // Calcular IRP (Índice de Riesgo por Procedencia)
      const overallAvg = filteredStats.length > 0
        ? filteredStats.reduce((sum, geo) => sum + geo.avgScore, 0) / filteredStats.length
        : 0;

      const recommendations = filteredStats.map(geo => {
        const riskIndex = this._calculateRiskIndex(geo.avgScore, overallAvg);
        const performanceLevel = this._getScorePerformanceLevel(geo.avgScore);
        
        return {
          province: geo._id.province || 'Sin información',
          canton: geo._id.canton || 'Sin información',
          avgScore: parseFloat(geo.avgScore.toFixed(2)),
          minScore: parseFloat(geo.minScore.toFixed(2)),
          maxScore: parseFloat(geo.maxScore.toFixed(2)),
          studentCount: geo.uniqueStudentCount || geo.studentCount,
          stdDev: parseFloat(geo.stdDev.toFixed(2)),
          riskIndex: parseFloat(riskIndex.toFixed(2)),
          riskLevel: this._getRiskLevel(riskIndex),
          performanceLevel: performanceLevel.level,
          recommendations: this._generateGeographicRecommendations(geo, overallAvg, riskIndex)
        };
      });

      return {
        overallAverage: parseFloat(overallAvg.toFixed(2)),
        locations: recommendations,
        summary: this._generateGeographicSummary(recommendations)
      };
    } catch (error) {
      throw new Error(`Error analyzing geographic performance: ${error.message}`);
    }
  }

  /**
   * Get difficulty index analysis per component
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Difficulty analysis
   */
  async getDifficultyIndexAnalysis(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const difficultyStats = await AdmissionData.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            correctasNum: {
              $cond: [
                { $or: [
                  { $eq: ['$preguntas_correctas', null] },
                  { $eq: ['$preguntas_correctas', ''] }
                ]},
                0,
                { $toDouble: '$preguntas_correctas' }
              ]
            },
            totalPreguntasNum: {
              $cond: [
                { $or: [
                  { $eq: ['$nro_preguntas', null] },
                  { $eq: ['$nro_preguntas', ''] }
                ]},
                1,
                { $toDouble: '$nro_preguntas' }
              ]
            }
          }
        },
        {
          $addFields: {
            successRate: {
              $multiply: [
                { $divide: ['$correctasNum', '$totalPreguntasNum'] },
                100
              ]
            }
          }
        },
        {
          $group: {
            _id: '$componente',
            avgSuccessRate: { $avg: '$successRate' },
            minSuccessRate: { $min: '$successRate' },
            maxSuccessRate: { $max: '$successRate' },
            totalAttempts: { $sum: 1 }
          }
        },
        { $sort: { avgSuccessRate: 1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const recommendations = difficultyStats.map(comp => {
        const difficultyLevel = this._getDifficultyLevel(comp.avgSuccessRate);
        
        return {
          component: comp._id,
          avgSuccessRate: parseFloat(comp.avgSuccessRate.toFixed(2)),
          minSuccessRate: parseFloat(comp.minSuccessRate.toFixed(2)),
          maxSuccessRate: parseFloat(comp.maxSuccessRate.toFixed(2)),
          difficultyIndex: parseFloat((100 - comp.avgSuccessRate).toFixed(2)),
          difficultyLevel: difficultyLevel.level,
          totalAttempts: comp.totalAttempts,
          recommendations: this._generateDifficultyRecommendations(comp, difficultyLevel)
        };
      });

      return {
        components: recommendations,
        summary: this._generateDifficultySummary(recommendations)
      };
    } catch (error) {
      throw new Error(`Error analyzing difficulty index: ${error.message}`);
    }
  }

  /**
   * Get performance by career (conCupoCarrera)
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Career analysis with recommendations
   */
  async getCareerPerformanceAnalysis(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      console.log(`[Career Analysis] Starting analysis with segmentation for 'sin cupo'`);

      const careerStats = await AdmissionData.aggregate([
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
            _id: {
              career: '$conCupoCarrera',
              usuario_id: '$usuario_id'
            },
            totalScore: { $sum: '$puntajeNumerico' },
            conCupo: { $first: '$conCupo' }
          }
        },
        {
          $group: {
            _id: '$_id.career',
            avgScore: { $avg: '$totalScore' },
            minScore: { $min: '$totalScore' },
            maxScore: { $max: '$totalScore' },
            applicantCount: { $sum: 1 },
            stdDev: { $stdDevPop: '$totalScore' },
            withQuota: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'SI'] }, 1, 0]
              }
            },
            withoutQuota: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'NO'] }, 1, 0]
              }
            },
            studentIds: { $addToSet: '$_id.usuario_id' }
          }
        },
        {
          $addFields: {
            uniqueApplicantCount: { $size: '$studentIds' }
          }
        },
        { $sort: { applicantCount: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      // Separate "Sin especificar" from valid careers
      const validCareers = careerStats.filter(c => c._id && c._id !== 'Sin especificar' && c._id.trim() !== '');
      const sinEspecificar = careerStats.find(c => !c._id || c._id === 'Sin especificar' || c._id.trim() === '');

      console.log(`[Career Analysis] Found ${validCareers.length} valid careers`);
      if (sinEspecificar) {
        console.log(`[Career Analysis] Found 'Sin especificar' with ${sinEspecificar.applicantCount} applicants`);
      }

      // Calculate overall average (excluding "Sin especificar")
      const overallAvg = validCareers.length > 0
        ? validCareers.reduce((sum, career) => sum + career.avgScore, 0) / validCareers.length
        : 0;

      // Get detailed stats for "sin cupo" analysis by career
      const noQuotaByCareer = await AdmissionData.aggregate([
        { $match: { ...matchStage, conCupo: 'NO' } },
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
              career: '$conCupoCarrera',
              usuario_id: '$usuario_id'
            },
            totalScore: { $sum: '$puntajeNumerico' }
          }
        },
        {
          $group: {
            _id: '$_id.career',
            avgScore: { $avg: '$totalScore' },
            minScore: { $min: '$totalScore' },
            maxScore: { $max: '$totalScore' },
            applicantCount: { $sum: 1 },
            stdDev: { $stdDevPop: '$totalScore' },
            studentIds: { $addToSet: '$_id.usuario_id' }
          }
        },
        {
          $addFields: {
            uniqueApplicantCount: { $size: '$studentIds' }
          }
        },
        { $sort: { avgScore: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      // Filter "Sin especificar" from no quota stats
      const validNoQuotaCareers = noQuotaByCareer.filter(c =>
        c._id && c._id !== 'Sin especificar' && c._id.trim() !== '' && c.uniqueApplicantCount >= 3
      );

      console.log(`[Career Analysis] Found ${validNoQuotaCareers.length} valid careers for 'sin cupo' analysis`);

      // Create no quota segment rankings
      const noQuotaSegment = {
        bestPerforming: validNoQuotaCareers.slice(0, 10).map(c => ({
          career: c._id,
          avgScore: parseFloat(c.avgScore.toFixed(2)),
          applicantCount: c.uniqueApplicantCount
        })),
        lowestPerforming: validNoQuotaCareers.slice(-10).reverse().map(c => ({
          career: c._id,
          avgScore: parseFloat(c.avgScore.toFixed(2)),
          applicantCount: c.uniqueApplicantCount
        }))
      };

      const recommendations = validCareers.map(career => {
        const actualApplicantCount = career.uniqueApplicantCount || career.applicantCount;
        const performanceLevel = this._getScorePerformanceLevel(career.avgScore);
        const competitiveness = this._getCompetitivenessLevel(actualApplicantCount);
        const quotaRate = (career.withQuota / actualApplicantCount * 100).toFixed(2);

        return {
          career: career._id || 'Sin especificar',
          avgScore: parseFloat(career.avgScore.toFixed(2)),
          minScore: parseFloat(career.minScore.toFixed(2)),
          maxScore: parseFloat(career.maxScore.toFixed(2)),
          applicantCount: actualApplicantCount,
          withQuota: career.withQuota,
          withoutQuota: career.withoutQuota,
          quotaRate: parseFloat(quotaRate),
          stdDev: parseFloat(career.stdDev.toFixed(2)),
          performanceLevel: performanceLevel.level,
          competitiveness: competitiveness.level,
          recommendations: this._generateCareerRecommendations(career, overallAvg, performanceLevel, competitiveness, quotaRate, actualApplicantCount)
        };
      });

      return {
        overallAverage: parseFloat(overallAvg.toFixed(2)),
        careers: recommendations,
        noQuotaSegment,
        summary: this._generateCareerSummary(recommendations)
      };
    } catch (error) {
      throw new Error(`Error analyzing career performance: ${error.message}`);
    }
  }

  // ============ HELPER METHODS ============

  _getPerformanceLevel(percentage) {
    if (percentage >= 80) return { level: 'Excelente', color: 'success' };
    if (percentage >= 70) return { level: 'Bueno', color: 'info' };
    if (percentage >= 60) return { level: 'Regular', color: 'warning' };
    return { level: 'Bajo', color: 'danger' };
  }

  _getScorePerformanceLevel(score) {
    if (score >= 800) return { level: 'Excelente', color: 'success' };
    if (score >= 600) return { level: 'Bueno', color: 'info' };
    if (score >= 400) return { level: 'Regular', color: 'warning' };
    return { level: 'Bajo', color: 'danger' };
  }

  _getVariabilityLevel(stdDev) {
    if (stdDev < 10) return { level: 'Baja', description: 'Resultados consistentes' };
    if (stdDev < 20) return { level: 'Media', description: 'Variabilidad moderada' };
    return { level: 'Alta', description: 'Resultados muy dispersos' };
  }

  _getDifficultyLevel(successRate) {
    if (successRate >= 70) return { level: 'Fácil', color: 'success' };
    if (successRate >= 50) return { level: 'Moderado', color: 'info' };
    if (successRate >= 30) return { level: 'Difícil', color: 'warning' };
    return { level: 'Muy Difícil', color: 'danger' };
  }

  _calculateRiskIndex(score, overallAvg) {
    // IRP = ((Promedio General - Puntaje Grupo) / Promedio General) * 100
    return ((overallAvg - score) / overallAvg) * 100;
  }

  _getRiskLevel(riskIndex) {
    if (riskIndex < 0) return 'Sin Riesgo';
    if (riskIndex < 10) return 'Riesgo Bajo';
    if (riskIndex < 20) return 'Riesgo Medio';
    return 'Riesgo Alto';
  }

  _getCompetitivenessLevel(applicantCount) {
    if (applicantCount >= 100) return { level: 'Muy Alta', color: 'danger' };
    if (applicantCount >= 50) return { level: 'Alta', color: 'warning' };
    if (applicantCount >= 20) return { level: 'Media', color: 'info' };
    return { level: 'Baja', color: 'success' };
  }

  _getSectorRiskLevel(sectorAvg, overallAvg) {
    const diff = overallAvg - sectorAvg;
    const percentage = (diff / overallAvg) * 100;

    if (diff < 0) return 'Rendimiento Superior';
    if (percentage < 5) return 'Riesgo Bajo';
    if (percentage < 15) return 'Riesgo Medio';
    return 'Riesgo Alto';
  }

  _generateComponentRecommendations(comp, overallAvg, performanceLevel, variability) {
    const recommendations = [];
    
    if (comp.avgPerformance < overallAvg) {
      recommendations.push({
        priority: 'Alta',
        type: 'Refuerzo',
        message: `Se recomienda reforzar la dimensión de ${comp._id} ya que está ${(overallAvg - comp.avgPerformance).toFixed(2)} puntos por debajo del promedio general.`
      });
    }

    if (performanceLevel.level === 'Bajo') {
      recommendations.push({
        priority: 'Crítica',
        type: 'Intervención',
        message: `Requiere intervención inmediata. El componente ${comp._id} presenta un rendimiento bajo (${comp.avgPerformance.toFixed(2)}%).`
      });
    }

    if (variability.level === 'Alta') {
      recommendations.push({
        priority: 'Media',
        type: 'Estandarización',
        message: `Alta variabilidad detectada. Se recomienda estandarizar la enseñanza de ${comp._id} para reducir la dispersión de resultados.`
      });
    }

    return recommendations;
  }

  _generateInstitutionRecommendations(inst, overallAvg, performanceLevel, studentCount = null) {
    const recommendations = [];
    const actualStudentCount = studentCount !== null ? studentCount : inst.studentCount;
    
    if (inst.avgScore < overallAvg) {
      const gap = overallAvg - inst.avgScore;
      recommendations.push({
        priority: gap > 200 ? 'Crítica' : 'Alta',
        type: 'Apoyo Institucional',
        message: `La institución "${inst._id.institution}" presenta un rendimiento ${gap.toFixed(2)} puntos por debajo del promedio. Se recomienda implementar programas de refuerzo académico.`
      });
    }

    if (performanceLevel.level === 'Bajo') {
      recommendations.push({
        priority: 'Crítica',
        type: 'Plan de Mejora',
        message: `Rendimiento bajo detectado. Se sugiere un plan de mejora integral enfocado en metodologías de enseñanza y recursos educativos.`
      });
    }

    if (actualStudentCount < 10) {
      recommendations.push({
        priority: 'Baja',
        type: 'Información',
        message: `Muestra pequeña (${actualStudentCount} estudiantes). Los resultados pueden no ser representativos.`
      });
    }

    return recommendations;
  }

  _generateGeographicRecommendations(geo, overallAvg, riskIndex) {
    const recommendations = [];
    
    if (riskIndex > 20) {
      recommendations.push({
        priority: 'Crítica',
        type: 'Zona de Atención Prioritaria',
        message: `${geo._id.province} - ${geo._id.canton} presenta un índice de riesgo alto (${riskIndex.toFixed(2)}%). Requiere programas de apoyo educativo focalizados.`
      });
    } else if (riskIndex > 10) {
      recommendations.push({
        priority: 'Alta',
        type: 'Seguimiento',
        message: `Zona con riesgo medio. Se recomienda monitoreo continuo y programas preventivos de refuerzo académico.`
      });
    }

    if (geo.avgScore < overallAvg * 0.7) {
      recommendations.push({
        priority: 'Crítica',
        type: 'Intervención Regional',
        message: `Rendimiento significativamente bajo. Considerar programas de nivelación académica y mejora de infraestructura educativa.`
      });
    }

    return recommendations;
  }

  _generateDifficultyRecommendations(comp, difficultyLevel) {
    const recommendations = [];
    
    if (difficultyLevel.level === 'Muy Difícil') {
      recommendations.push({
        priority: 'Alta',
        type: 'Revisión de Contenido',
        message: `El componente ${comp._id} presenta alta dificultad (${comp.avgSuccessRate.toFixed(2)}% de éxito). Revisar el nivel de complejidad de las preguntas.`
      });
    }

    if (difficultyLevel.level === 'Fácil' && comp.avgSuccessRate > 85) {
      recommendations.push({
        priority: 'Media',
        type: 'Ajuste de Dificultad',
        message: `Las preguntas de ${comp._id} pueden ser demasiado fáciles. Considerar aumentar gradualmente la complejidad para mejor discriminación.`
      });
    }

    return recommendations;
  }

  _generateOverallComponentSummary(recommendations) {
    const critical = recommendations.filter(r => r.performanceLevel === 'Bajo');
    const needsImprovement = recommendations.filter(r => r.performanceLevel === 'Regular');
    
    return {
      totalComponents: recommendations.length,
      criticalComponents: critical.length,
      componentsNeedingImprovement: needsImprovement.length,
      mainRecommendation: critical.length > 0 
        ? `Priorizar refuerzo en: ${critical.map(c => c.component).join(', ')}`
        : 'El rendimiento general es aceptable. Continuar con el plan actual.'
    };
  }

  _generateInstitutionSummary(recommendations) {
    const critical = recommendations.filter(r => r.performanceLevel === 'Bajo');
    
    return {
      totalInstitutions: recommendations.length,
      institutionsAtRisk: critical.length,
      percentageAtRisk: ((critical.length / recommendations.length) * 100).toFixed(2),
      mainRecommendation: critical.length > 0
        ? `${critical.length} instituciones requieren atención prioritaria`
        : 'El rendimiento institucional es estable.'
    };
  }

  _generateGeographicSummary(recommendations) {
    const highRisk = recommendations.filter(r => r.riskLevel === 'Riesgo Alto');
    const mediumRisk = recommendations.filter(r => r.riskLevel === 'Riesgo Medio');
    
    return {
      totalLocations: recommendations.length,
      highRiskZones: highRisk.length,
      mediumRiskZones: mediumRisk.length,
      percentageHighRisk: ((highRisk.length / recommendations.length) * 100).toFixed(2),
      mainRecommendation: highRisk.length > 0
        ? `Implementar programas focalizados en ${highRisk.length} zonas de alto riesgo`
        : 'La distribución geográfica del rendimiento es equilibrada.'
    };
  }

  _generateDifficultySummary(recommendations) {
    const veryDifficult = recommendations.filter(r => r.difficultyLevel === 'Muy Difícil');
    const difficult = recommendations.filter(r => r.difficultyLevel === 'Difícil');
    
    return {
      totalComponents: recommendations.length,
      veryDifficultComponents: veryDifficult.length,
      difficultComponents: difficult.length,
      mainRecommendation: veryDifficult.length > 0
        ? `Revisar el nivel de dificultad en: ${veryDifficult.map(c => c.component).join(', ')}`
        : 'El nivel de dificultad es adecuado.'
    };
  }

  _generateCareerRecommendations(career, overallAvg, performanceLevel, competitiveness, quotaRate, applicantCount = null) {
    const recommendations = [];
    const actualApplicantCount = applicantCount !== null ? applicantCount : career.applicantCount;
    
    if (competitiveness.level === 'Muy Alta' || competitiveness.level === 'Alta') {
      recommendations.push({
        priority: 'Alta',
        type: 'Alta Demanda',
        message: `La carrera "${career._id}" tiene ${actualApplicantCount} postulantes (competitividad ${competitiveness.level}). Considerar aumentar cupos o implementar procesos de selección más rigurosos.`
      });
    }

    if (career.avgScore < overallAvg) {
      const gap = overallAvg - career.avgScore;
      recommendations.push({
        priority: gap > 100 ? 'Crítica' : 'Media',
        type: 'Nivelación Académica',
        message: `El rendimiento promedio está ${gap.toFixed(2)} puntos por debajo del promedio general. Se recomienda implementar programas de nivelación para los postulantes.`
      });
    }

    if (parseFloat(quotaRate) < 30 && actualApplicantCount > 10) {
      recommendations.push({
        priority: 'Alta',
        type: 'Tasa de Admisión',
        message: `Solo el ${quotaRate}% de postulantes obtiene cupo. Revisar criterios de admisión o considerar ampliar la oferta académica.`
      });
    }

    if (parseFloat(quotaRate) > 80 && actualApplicantCount > 20) {
      recommendations.push({
        priority: 'Baja',
        type: 'Alta Tasa de Admisión',
        message: `El ${quotaRate}% de postulantes obtiene cupo. La carrera tiene alta capacidad de absorción.`
      });
    }

    if (performanceLevel.level === 'Bajo') {
      recommendations.push({
        priority: 'Crítica',
        type: 'Rendimiento Bajo',
        message: `Los postulantes presentan rendimiento bajo (${career.avgScore.toFixed(2)} puntos). Considerar cursos preparatorios o ajustar requisitos de ingreso.`
      });
    }

    return recommendations;
  }

  _generateCareerSummary(recommendations) {
    const mostCompetitive = recommendations
      .filter(r => r.applicantCount > 0)
      .sort((a, b) => b.applicantCount - a.applicantCount)
      .slice(0, 5);
    
    const highestPerformance = recommendations
      .filter(r => r.applicantCount > 10)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);
    
    const lowestQuotaRate = recommendations
      .filter(r => r.applicantCount > 10)
      .sort((a, b) => a.quotaRate - b.quotaRate)
      .slice(0, 3);

    return {
      totalCareers: recommendations.length,
      totalApplicants: recommendations.reduce((sum, r) => sum + r.applicantCount, 0),
      mostCompetitiveCareers: mostCompetitive.map(c => ({
        career: c.career,
        applicants: c.applicantCount,
        quotaRate: c.quotaRate
      })),
      highestPerformanceCareers: highestPerformance.map(c => ({
        career: c.career,
        avgScore: c.avgScore,
        applicants: c.applicantCount
      })),
      lowestQuotaRateCareers: lowestQuotaRate.map(c => ({
        career: c.career,
        quotaRate: c.quotaRate,
        applicants: c.applicantCount
      })),
      mainRecommendation: mostCompetitive.length > 0
        ? `Las carreras más demandadas son: ${mostCompetitive.slice(0, 3).map(c => c.career).join(', ')}`
        : 'Analizar estrategias de promoción de carreras con baja demanda.'
    };
  }
}

module.exports = new DataMiningService();
