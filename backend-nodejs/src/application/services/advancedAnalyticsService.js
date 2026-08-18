const AdmissionData = require('../../domain/models/AdmissionData');
const { timeouts } = require('../../config/database');

/**
 * Advanced Analytics Service for deep insights and correlations
 */
class AdvancedAnalyticsService {
  /**
   * Get gender-career correlation analysis
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Gender-career correlation with gap analysis
   */
  async getGenderCareerAnalysis(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const genderCareerStats = await AdmissionData.aggregate([
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
              gender: '$sexo',
              usuario_id: '$usuario_id'
            },
            totalScore: { $sum: '$puntajeNumerico' },
            conCupo: { $first: '$conCupo' }
          }
        },
        {
          $group: {
            _id: {
              career: '$_id.career',
              gender: '$_id.gender'
            },
            avgScore: { $avg: '$totalScore' },
            applicantCount: { $sum: 1 },
            withQuota: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'SI'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { '_id.career': 1, '_id.gender': 1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const careerMap = {};
      genderCareerStats.forEach(stat => {
        const career = stat._id.career || 'Sin especificar';
        const gender = stat._id.gender || 'No especificado';
        
        if (!careerMap[career]) {
          careerMap[career] = {};
        }
        
        careerMap[career][gender] = {
          avgScore: parseFloat(stat.avgScore.toFixed(2)),
          applicantCount: stat.applicantCount,
          withQuota: stat.withQuota,
          quotaRate: parseFloat((stat.withQuota / stat.applicantCount * 100).toFixed(2))
        };
      });

      const analysis = Object.keys(careerMap).map(career => {
        const genderData = careerMap[career];
        const genders = Object.keys(genderData);
        
        // Calculate quota share for each gender in this career
        const totalCareerQuotas = Object.values(genderData).reduce((sum, g) => sum + (g.withQuota || 0), 0);
        Object.keys(genderData).forEach(g => {
          genderData[g].quotaShare = totalCareerQuotas > 0
            ? parseFloat(((genderData[g].withQuota / totalCareerQuotas) * 100).toFixed(2))
            : 0;
        });

        let genderGap = null;
        let gapType = 'No aplicable';
        let recommendations = [];

        if (genders.length === 2) {
          const [gender1, gender2] = genders.sort();
          const score1 = genderData[gender1].avgScore;
          const score2 = genderData[gender2].avgScore;
          const gap = Math.abs(score1 - score2);
          const maxScore = Math.max(score1, score2);
          const percentGap = maxScore > 0 ? ((gap / maxScore) * 100).toFixed(2) : '0.00';
          const floatPercentGap = parseFloat(percentGap);
          
          genderGap = {
            gap: parseFloat(gap.toFixed(2)),
            percentGap: floatPercentGap,
            higherPerforming: score1 > score2 ? gender1 : gender2,
            lowerPerforming: score1 > score2 ? gender2 : gender1
          };

          if (floatPercentGap > 15) {
            gapType = 'Brecha Significativa';
            recommendations.push({
              priority: 'Alta',
              type: 'Equidad de Género',
              message: `Brecha significativa de ${percentGap}% (${gap.toFixed(2)} pts) en ${career}. Se recomienda investigar factores que afectan el rendimiento de ${genderGap.lowerPerforming}.`
            });
          } else if (floatPercentGap >= 5) {
            gapType = 'Brecha Moderada';
            recommendations.push({
              priority: 'Media',
              type: 'Monitoreo',
              message: `Diferencia moderada de ${percentGap}% (${gap.toFixed(2)} pts) en ${career}. Continuar monitoreando tendencias.`
            });
          } else {
            gapType = 'Equitativo';
          }

          const totalApplicants = genderData[gender1].applicantCount + genderData[gender2].applicantCount;
          const ratio1 = (genderData[gender1].applicantCount / totalApplicants * 100).toFixed(2);
          const ratio2 = (genderData[gender2].applicantCount / totalApplicants * 100).toFixed(2);

          if (Math.abs(ratio1 - ratio2) > 30) {
            recommendations.push({
              priority: 'Media',
              type: 'Distribución de Género',
              message: `Desbalance en asignación de cupos por género: ${gender1} ${ratio1}% vs ${gender2} ${ratio2}%. Considerar estrategias de promoción equitativa.`
            });
          }
        }

        return {
          career,
          genderData,
          genderGap,
          gapType,
          totalApplicants: Object.values(genderData).reduce((sum, g) => sum + g.applicantCount, 0),
          recommendations
        };
      });

      const significantGaps = analysis.filter(a => a.gapType === 'Brecha Significativa');
      const moderateGaps = analysis.filter(a => a.gapType === 'Brecha Moderada');

      return {
        careers: analysis.sort((a, b) => b.totalApplicants - a.totalApplicants),
        summary: {
          totalCareers: analysis.length,
          careersWithSignificantGap: significantGaps.length,
          careersWithModerateGap: moderateGaps.length,
          equitableCareers: analysis.filter(a => a.gapType === 'Equitativo').length,
          mainRecommendation: significantGaps.length > 0
            ? `${significantGaps.length} carreras presentan brechas significativas de género que requieren atención.`
            : 'La mayoría de carreras muestran equidad de género en rendimiento.'
        }
      };
    } catch (error) {
      throw new Error(`Error analyzing gender-career correlation: ${error.message}`);
    }
  }

  /**
   * Get disability impact analysis
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Disability impact on performance
   */
  async getDisabilityImpactAnalysis(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const disabilityStats = await AdmissionData.aggregate([
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
            },
            hasDisability: {
              $cond: [
                { $and: [
                  { $ne: ['$cierreCarnetDiscapacidad', null] },
                  { $ne: ['$cierreCarnetDiscapacidad', ''] }
                ]},
                true,
                false
              ]
            }
          }
        },
        {
          $group: {
            _id: {
              usuario_id: '$usuario_id',
              hasDisability: '$hasDisability',
              disabilityType: '$cierreTipoDiscapacidad',
              disabilityPercent: '$cierrePrcjDiscapacidad'
            },
            totalScore: { $sum: '$puntajeNumerico' },
            conCupo: { $first: '$conCupo' }
          }
        },
        {
          $group: {
            _id: {
              hasDisability: '$_id.hasDisability',
              disabilityType: '$_id.disabilityType'
            },
            avgScore: { $avg: '$totalScore' },
            minScore: { $min: '$totalScore' },
            maxScore: { $max: '$totalScore' },
            studentCount: { $sum: 1 },
            stdDev: { $stdDevPop: '$totalScore' },
            withQuota: {
              $sum: {
                $cond: [{ $eq: ['$conCupo', 'SI'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { '_id.hasDisability': -1, avgScore: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const withDisability = disabilityStats.filter(s => s._id.hasDisability);
      const withoutDisability = disabilityStats.find(s => !s._id.hasDisability);

      const avgScoreWithout = withoutDisability ? withoutDisability.avgScore : 0;
      const quotaRateWithout = withoutDisability 
        ? (withoutDisability.withQuota / withoutDisability.studentCount * 100).toFixed(2)
        : 0;

      const byDisabilityType = withDisability.map(stat => {
        const gap = avgScoreWithout - stat.avgScore;
        const quotaRate = (stat.withQuota / stat.studentCount * 100).toFixed(2);
        const percentGap = ((gap / avgScoreWithout) * 100);

        // Performance classification based on comparison with students without disability
        let performanceClassification;
        let performanceColor;

        if (percentGap <= -5) {
          // Disability group performs BETTER (negative gap means they score higher)
          performanceClassification = 'Mejor desempeño';
          performanceColor = 'green';
        } else if (percentGap >= 5) {
          // Disability group performs WORSE (positive gap means they score lower)
          performanceClassification = 'Peor desempeño';
          performanceColor = 'red';
        } else {
          // Within ±5% - considered similar
          performanceClassification = 'Similar';
          performanceColor = 'yellow';
        }

        return {
          disabilityType: stat._id.disabilityType || 'No especificado',
          avgScore: parseFloat(stat.avgScore.toFixed(2)),
          minScore: parseFloat(stat.minScore.toFixed(2)),
          maxScore: parseFloat(stat.maxScore.toFixed(2)),
          studentCount: stat.studentCount,
          stdDev: parseFloat(stat.stdDev.toFixed(2)),
          quotaRate: parseFloat(quotaRate),
          gapVsNoDisability: parseFloat(gap.toFixed(2)),
          percentGap: parseFloat(percentGap.toFixed(2)),
          performanceClassification,
          performanceColor,
          recommendations: this._generateDisabilityRecommendations(stat, gap, quotaRate, performanceClassification)
        };
      });

      const totalWithDisability = withDisability.reduce((sum, s) => sum + s.studentCount, 0);
      const totalWithout = withoutDisability ? withoutDisability.studentCount : 0;
      const avgGap = withDisability.length > 0
        ? withDisability.reduce((sum, s) => sum + (avgScoreWithout - s.avgScore), 0) / withDisability.length
        : 0;

      return {
        withoutDisability: withoutDisability ? {
          avgScore: parseFloat(avgScoreWithout.toFixed(2)),
          studentCount: totalWithout,
          quotaRate: parseFloat(quotaRateWithout)
        } : null,
        byDisabilityType,
        summary: {
          totalWithDisability,
          totalWithoutDisability: totalWithout,
          percentageWithDisability: parseFloat(((totalWithDisability / (totalWithDisability + totalWithout)) * 100).toFixed(2)),
          averageGap: parseFloat(avgGap.toFixed(2)),
          disabilityTypes: withDisability.length,
          mainRecommendation: avgGap > 50
            ? `Brecha promedio de ${avgGap.toFixed(2)} puntos. Se requieren programas de apoyo específicos para estudiantes con discapacidad.`
            : 'La inclusión es efectiva, pero continuar con apoyos individualizados.'
        }
      };
    } catch (error) {
      throw new Error(`Error analyzing disability impact: ${error.message}`);
    }
  }

  /**
   * Get response strategy analysis
   * @param {string} period - Academic period (optional)
   * @param {number} year - Academic year (optional)
   * @returns {Promise<Object>} Analysis of answer strategies
   */
  async getResponseStrategyAnalysis(period, year) {
    try {
      const matchStage = {};
      if (period) matchStage.period = period;
      if (year) matchStage.year = parseInt(year);

      const strategyStats = await AdmissionData.aggregate([
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
            incorrectasNum: {
              $cond: [
                { $or: [
                  { $eq: ['$preguntas_incorrectas', null] },
                  { $eq: ['$preguntas_incorrectas', ''] }
                ]},
                0,
                { $toDouble: '$preguntas_incorrectas' }
              ]
            },
            noContestadasNum: {
              $cond: [
                { $or: [
                  { $eq: ['$preguntas_no_contestadas', null] },
                  { $eq: ['$preguntas_no_contestadas', ''] }
                ]},
                0,
                { $toDouble: '$preguntas_no_contestadas' }
              ]
            },
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
          $addFields: {
            totalPreguntas: { $add: ['$correctasNum', '$incorrectasNum', '$noContestadasNum'] },
            answeredQuestions: { $add: ['$correctasNum', '$incorrectasNum'] }
          }
        },
        {
          $group: {
            _id: '$componente',
            avgCorrect: { $avg: '$correctasNum' },
            avgIncorrect: { $avg: '$incorrectasNum' },
            avgUnanswered: { $avg: '$noContestadasNum' },
            avgScore: { $avg: '$puntajeNumerico' },
            totalAttempts: { $sum: 1 }
          }
        },
        { $sort: { avgScore: -1 } }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const detailedAnalysis = await AdmissionData.aggregate([
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
            incorrectasNum: {
              $cond: [
                { $or: [
                  { $eq: ['$preguntas_incorrectas', null] },
                  { $eq: ['$preguntas_incorrectas', ''] }
                ]},
                0,
                { $toDouble: '$preguntas_incorrectas' }
              ]
            },
            noContestadasNum: {
              $cond: [
                { $or: [
                  { $eq: ['$preguntas_no_contestadas', null] },
                  { $eq: ['$preguntas_no_contestadas', ''] }
                ]},
                0,
                { $toDouble: '$preguntas_no_contestadas' }
              ]
            },
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
            _id: '$usuario_id',
            totalCorrect: { $sum: '$correctasNum' },
            totalIncorrect: { $sum: '$incorrectasNum' },
            totalUnanswered: { $sum: '$noContestadasNum' },
            totalScore: { $sum: '$puntajeNumerico' }
          }
        },
        {
          $addFields: {
            strategyType: {
              $cond: [
                { $gt: ['$totalUnanswered', 5] }, 'Conservative',
                { $cond: [
                  { $gt: ['$totalIncorrect', '$totalUnanswered'] }, 'Aggressive', 'Balanced'
                ]}
              ]
            }
          }
        },
        {
          $group: {
            _id: '$strategyType',
            avgScore: { $avg: '$totalScore' },
            studentCount: { $sum: 1 },
            avgCorrect: { $avg: '$totalCorrect' },
            avgIncorrect: { $avg: '$totalIncorrect' },
            avgUnanswered: { $avg: '$totalUnanswered' }
          }
        }
      ]).option({ maxTimeMS: timeouts.aggregation });

      const byComponent = strategyStats.map(comp => ({
        component: comp._id,
        avgCorrect: parseFloat(comp.avgCorrect.toFixed(2)),
        avgIncorrect: parseFloat(comp.avgIncorrect.toFixed(2)),
        avgUnanswered: parseFloat(comp.avgUnanswered.toFixed(2)),
        avgScore: parseFloat(comp.avgScore.toFixed(2)),
        totalAttempts: comp.totalAttempts,
        recommendations: this._generateStrategyRecommendations(comp)
      }));

      const byStrategy = detailedAnalysis.map(strat => ({
        strategyType: strat._id,
        avgScore: parseFloat(strat.avgScore.toFixed(2)),
        studentCount: strat.studentCount,
        avgCorrect: parseFloat(strat.avgCorrect.toFixed(2)),
        avgIncorrect: parseFloat(strat.avgIncorrect.toFixed(2)),
        avgUnanswered: parseFloat(strat.avgUnanswered.toFixed(2))
      }));

      const bestStrategy = byStrategy.reduce((best, current) => 
        current.avgScore > best.avgScore ? current : best
      , byStrategy[0] || { strategyType: 'None', avgScore: 0 });

      return {
        byComponent,
        byStrategy,
        summary: {
          totalComponents: byComponent.length,
          bestStrategy: bestStrategy.strategyType,
          bestStrategyScore: bestStrategy.avgScore,
          mainRecommendation: this._generateMainStrategyRecommendation(byStrategy, bestStrategy)
        }
      };
    } catch (error) {
      throw new Error(`Error analyzing response strategies: ${error.message}`);
    }
  }

  _generateDisabilityRecommendations(stat, gap, quotaRate, performanceClassification) {
    const recommendations = [];

    // Add performance classification note
    if (performanceClassification === 'Mejor desempeño') {
      recommendations.push({
        priority: 'Info',
        type: 'Clasificación',
        message: `Estudiantes con ${stat._id.disabilityType || 'este tipo de discapacidad'} muestran un rendimiento superior al grupo sin discapacidad.`
      });
    } else if (performanceClassification === 'Peor desempeño') {
      recommendations.push({
        priority: 'Info',
        type: 'Clasificación',
        message: `Estudiantes con ${stat._id.disabilityType || 'este tipo de discapacidad'} muestran un rendimiento inferior al grupo sin discapacidad.`
      });
    } else {
      recommendations.push({
        priority: 'Info',
        type: 'Clasificación',
        message: `Estudiantes con ${stat._id.disabilityType || 'este tipo de discapacidad'} tienen un rendimiento similar al grupo sin discapacidad.`
      });
    }

    if (gap > 100) {
      recommendations.push({
        priority: 'Crítica',
        type: 'Apoyo Académico',
        message: `Brecha de ${gap.toFixed(2)} puntos para estudiantes con discapacidad ${stat._id.disabilityType}. Implementar programas de nivelación específicos.`
      });
    } else if (gap > 50) {
      recommendations.push({
        priority: 'Alta',
        type: 'Refuerzo',
        message: `Diferencia significativa detectada. Considerar tutorías personalizadas y adaptaciones curriculares.`
      });
    }

    if (parseFloat(quotaRate) < 20 && stat.studentCount > 5) {
      recommendations.push({
        priority: 'Alta',
        type: 'Inclusión',
        message: `Baja tasa de admisión (${quotaRate}%). Revisar políticas de inclusión y ajustes razonables en el proceso de admisión.`
      });
    }

    return recommendations;
  }

  _generateStrategyRecommendations(comp) {
    const recommendations = [];
    const unansweredRate = (comp.avgUnanswered / (comp.avgCorrect + comp.avgIncorrect + comp.avgUnanswered)) * 100;

    if (unansweredRate > 20) {
      recommendations.push({
        priority: 'Media',
        type: 'Orientación',
        message: `${unansweredRate.toFixed(2)}% de preguntas sin contestar en ${comp._id}. Orientar sobre gestión del tiempo de examen.`
      });
    }

    if (comp.avgIncorrect > comp.avgCorrect * 1.5) {
      recommendations.push({
        priority: 'Alta',
        type: 'Preparación',
        message: `Alta tasa de respuestas incorrectas. Reforzar conocimientos en ${comp._id} antes del examen.`
      });
    }

    return recommendations;
  }

  _generateMainStrategyRecommendation(strategies, best) {
    if (best.strategyType === 'Aggressive') {
      return `La estrategia "Agresiva" (contestar todo) obtiene mejores resultados con ${best.avgScore.toFixed(2)} puntos promedio. Recomendar a estudiantes contestar todas las preguntas.`;
    } else if (best.strategyType === 'Conservative') {
      return `La estrategia "Conservadora" (dejar sin contestar cuando hay duda) es más efectiva con ${best.avgScore.toFixed(2)} puntos. Aconsejar no adivinar respuestas.`;
    } else {
      return `Una estrategia "Balanceada" muestra mejores resultados. Contestar solo cuando hay certeza razonable.`;
    }
  }
}

module.exports = new AdvancedAnalyticsService();
