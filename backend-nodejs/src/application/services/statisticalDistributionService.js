const AdmissionData = require('../../domain/models/AdmissionData');

/**
 * Calculate basic statistics for a dataset
 * @param {Array<number>} values - Array of numerical values
 * @returns {Object} Object containing mean, variance, standard deviation
 */
const calculateBasicStats = (values) => {
  const n = values.length;
  if (n === 0) return { mean: 0, variance: 0, stdDev: 0 };

  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return { mean, variance, stdDev };
};

/**
 * Calculate percentile for a normal distribution
 * @param {number} zScore - Z-score
 * @returns {number} Percentile (0-100)
 */
const normalCDF = (zScore) => {
  const sign = zScore < 0 ? -1 : 1;
  zScore = Math.abs(zScore) / Math.sqrt(2);

  const t = 1.0 / (1.0 + 0.5 * zScore);
  const y = 1 - t * Math.exp(
    -zScore * zScore -
    1.26551223 +
    1.00002368 * t +
    0.37409196 * t * t +
    0.09678418 * t * t * t -
    0.18628806 * t * t * t * t +
    0.27886807 * t * t * t * t * t -
    1.13520398 * t * t * t * t * t * t +
    1.48851587 * t * t * t * t * t * t * t -
    0.82215223 * t * t * t * t * t * t * t * t +
    0.17087277 * t * t * t * t * t * t * t * t * t
  );

  return 0.5 * (1 + sign * y);
};

/**
 * Get distribution analysis by component
 * @param {Object} filters - Filters including period, year, component
 * @returns {Promise<Object>} Distribution analysis
 */
const getDistributionByComponent = async (filters) => {
  const { period, year, componente } = filters;
  const query = {};

  if (period) query.period = period;
  if (year) query.year = year;
  if (componente) query.componente = componente;

  const pipeline = [
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
        _id: '$componente',
        scores: { $push: '$puntajeNumerico' },
        studentIds: { $push: '$studentId' },
        studentNames: { $push: '$studentName' },
        quiz: { $first: '$quiz' },
        count: { $sum: 1 }
      }
    }
  ];

  const results = await AdmissionData.aggregate(pipeline);

  const analyses = results.map(result => {
    const { mean, variance, stdDev } = calculateBasicStats(result.scores);

    // Calculate percentiles for each score
    const scoreAnalysis = result.scores.map((score, index) => {
      const zScore = stdDev > 0 ? (score - mean) / stdDev : 0;
      const percentile = normalCDF(zScore) * 100;

      // Determine if score is atypical (outside 2 standard deviations)
      const isAtypical = Math.abs(zScore) > 2;

      return {
        studentId: result.studentIds[index],
        studentName: result.studentNames[index],
        score,
        zScore: parseFloat(zScore.toFixed(4)),
        percentile: parseFloat(percentile.toFixed(2)),
        isAtypical,
        deviationFromMean: parseFloat((score - mean).toFixed(2))
      };
    });

    // Distribution analysis
    const sortedScores = [...result.scores].sort((a, b) => a - b);
    const median = sortedScores.length % 2 === 0
      ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
      : sortedScores[Math.floor(sortedScores.length / 2)];

    const q1Index = Math.floor(sortedScores.length * 0.25);
    const q3Index = Math.floor(sortedScores.length * 0.75);
    const q1 = sortedScores[q1Index];
    const q3 = sortedScores[q3Index];
    const iqr = q3 - q1;

    // Identify outliers using IQR method
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = scoreAnalysis.filter(s => s.score < lowerBound || s.score > upperBound);

    // Normal distribution classification
    const withinOneStdDev = scoreAnalysis.filter(s => Math.abs(s.zScore) <= 1).length;
    const withinTwoStdDev = scoreAnalysis.filter(s => Math.abs(s.zScore) <= 2).length;
    const withinThreeStdDev = scoreAnalysis.filter(s => Math.abs(s.zScore) <= 3).length;

    return {
      componente: result._id,
      quiz: result.quiz,
      totalStudents: result.count,
      statistics: {
        mean: parseFloat(mean.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        mode: parseFloat(calculateMode(result.scores).toFixed(2)),
        variance: parseFloat(variance.toFixed(2)),
        standardDeviation: parseFloat(stdDev.toFixed(2)),
        min: sortedScores[0],
        max: sortedScores[sortedScores.length - 1],
        range: parseFloat((sortedScores[sortedScores.length - 1] - sortedScores[0]).toFixed(2)),
        q1: parseFloat(q1.toFixed(2)),
        q3: parseFloat(q3.toFixed(2)),
        iqr: parseFloat(iqr.toFixed(2))
      },
      normalDistribution: {
        withinOneStdDev: {
          count: withinOneStdDev,
          percentage: parseFloat((withinOneStdDev / result.count * 100).toFixed(2))
        },
        withinTwoStdDev: {
          count: withinTwoStdDev,
          percentage: parseFloat((withinTwoStdDev / result.count * 100).toFixed(2))
        },
        withinThreeStdDev: {
          count: withinThreeStdDev,
          percentage: parseFloat((withinThreeStdDev / result.count * 100).toFixed(2))
        }
      },
      outliers: {
        total: outliers.length,
        percentage: parseFloat((outliers.length / result.count * 100).toFixed(2)),
        details: outliers.map(o => ({
          studentId: o.studentId,
          studentName: o.studentName,
          score: o.score,
          deviationFromMean: o.deviationFromMean,
          zScore: o.zScore
        }))
      },
      atypicalScores: {
        total: scoreAnalysis.filter(s => s.isAtypical).length,
        percentage: parseFloat((scoreAnalysis.filter(s => s.isAtypical).length / result.count * 100).toFixed(2)),
        details: scoreAnalysis.filter(s => s.isAtypical).map(s => ({
          studentId: s.studentId,
          studentName: s.studentName,
          score: s.score,
          zScore: s.zScore,
          percentile: s.percentile,
          deviationFromMean: s.deviationFromMean
        }))
      }
    };
  });

  return analyses;
};

/**
 * Calculate mode of an array
 * @param {Array<number>} values - Array of numerical values
 * @returns {number} Mode
 */
const calculateMode = (values) => {
  const frequency = {};
  let maxFreq = 0;
  let mode = values[0];

  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });

  return mode;
};

/**
 * Get all available components with additional information
 * @param {Object} filters - Filters including period, year
 * @returns {Promise<Array<Object>>} Array of component objects with details
 */
const getAvailableComponents = async (filters) => {
  const { period, year } = filters;
  const query = {};

  if (period) query.period = period;
  if (year) query.year = year;

  // Get components with count, average score and additional info
  const pipeline = [
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
        _id: '$componente',
        count: { $sum: 1 },
        averageScore: { $avg: '$puntajeNumerico' },
        maxScore: { $max: '$puntajeNumerico' },
        minScore: { $min: '$puntajeNumerico' },
        quiz: { $first: '$quiz' },
        period: { $first: '$period' },
        year: { $first: '$year' }
      }
    },
    {
      $project: {
        componente: '$_id',
        count: 1,
        averageScore: { $round: ['$averageScore', 2] },
        maxScore: { $round: ['$maxScore', 2] },
        minScore: { $round: ['$minScore', 2] },
        quiz: 1,
        period: 1,
        year: 1,
        _id: 0
      }
    },
    {
      $sort: { componente: 1 }
    }
  ];

  const results = await AdmissionData.aggregate(pipeline);
  return results.filter(c => c.componente && c.componente.trim() !== '');
};

/**
 * Get comparative analysis between periods
 * @param {Object} filters - Filters including componentes, periods to compare
 * @returns {Promise<Object>} Comparative analysis
 */
const getComparativeAnalysis = async (filters) => {
  const { componente, period1, period2, year } = filters;

  const getStatsForPeriod = async (period) => {
    const query = { componente, period };
    if (year) query.year = year;

    const pipeline = [
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
          _id: null,
          scores: { $push: '$puntajeNumerico' },
          count: { $sum: 1 }
        }
      }
    ];

    const result = await AdmissionData.aggregate(pipeline);
    if (!result || result.length === 0) return null;

    const { mean, variance, stdDev } = calculateBasicStats(result[0].scores);
    const sortedScores = result[0].scores.sort((a, b) => a - b);

    return {
      period,
      count: result[0].count,
      mean: parseFloat(mean.toFixed(2)),
      variance: parseFloat(variance.toFixed(2)),
      standardDeviation: parseFloat(stdDev.toFixed(2)),
      min: sortedScores[0],
      max: sortedScores[sortedScores.length - 1],
      median: sortedScores.length % 2 === 0
        ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
        : sortedScores[Math.floor(sortedScores.length / 2)]
    };
  };

  const [stats1, stats2] = await Promise.all([
    getStatsForPeriod(period1),
    getStatsForPeriod(period2)
  ]);

  if (!stats1 || !stats2) {
    throw new Error('No data found for one or both periods');
  }

  // Calculate differences
  const meanDifference = stats2.mean - stats1.mean;
  const meanChangePercent = stats1.mean !== 0
    ? (meanDifference / stats1.mean) * 100
    : 0;

  const stdDevDifference = stats2.standardDeviation - stats1.standardDeviation;

  return {
    componente,
    comparison: {
      period1: stats1,
      period2: stats2,
      differences: {
        meanDifference: parseFloat(meanDifference.toFixed(2)),
        meanChangePercent: parseFloat(meanChangePercent.toFixed(2)),
        stdDevDifference: parseFloat(stdDevDifference.toFixed(2)),
        countDifference: stats2.count - stats1.count
      }
    }
  };
};

/**
 * Get median distribution analysis for dashboard
 * Calculates median of total scores and segments students above/below median
 * @param {Object} filters - Filters including period, year
 * @returns {Promise<Object>} Median distribution analysis
 */
const getMedianDistribution = async (filters) => {
  const { period, year } = filters;
  const query = {};

  if (period) query.period = period;
  if (year) query.year = year;

  // Aggregate to get total scores per student
  const pipeline = [
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
        _id: '$usuario_id',
        studentId: { $first: '$studentId' },
        studentName: { $first: '$studentName' },
        totalScore: { $sum: '$puntajeNumerico' }
      }
    },
    {
      $sort: { totalScore: 1 }
    }
  ];

  const results = await AdmissionData.aggregate(pipeline);

  if (results.length === 0) {
    return {
      totalStudents: 0,
      median: 0,
      mean: 0,
      standardDeviation: 0,
      aboveMedian: { count: 0, percentage: 0, students: [] },
      belowMedian: { count: 0, percentage: 0, students: [] },
      scoreDistribution: []
    };
  }

  // Calculate basic statistics
  const scores = results.map(r => r.totalScore);
  const { mean, variance, stdDev } = calculateBasicStats(scores);

  // Calculate median
  const sortedScores = [...scores].sort((a, b) => a - b);
  const median = sortedScores.length % 2 === 0
    ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
    : sortedScores[Math.floor(sortedScores.length / 2)];

  // Segment students above and below median
  const aboveMedian = results.filter(r => r.totalScore > median);
  const belowMedian = results.filter(r => r.totalScore < median);
  const equalMedian = results.filter(r => r.totalScore === median);

  // Create score distribution for normal curve chart (bins of 50 points)
  const minScore = sortedScores[0];
  const maxScore = sortedScores[sortedScores.length - 1];
  const binSize = 50;
  const numBins = Math.ceil((maxScore - minScore) / binSize) + 1;
  const distribution = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = minScore + (i * binSize);
    const binEnd = binStart + binSize;
    const count = scores.filter(s => s >= binStart && s < binEnd).length;
    distribution.push({
      range: `${binStart}-${binEnd}`,
      midPoint: binStart + binSize / 2,
      count,
      percentage: parseFloat((count / results.length * 100).toFixed(2))
    });
  }

  // Return top 10 students for each segment (to avoid large responses)
  return {
    totalStudents: results.length,
    statistics: {
      median: parseFloat(median.toFixed(2)),
      mean: parseFloat(mean.toFixed(2)),
      standardDeviation: parseFloat(stdDev.toFixed(2)),
      variance: parseFloat(variance.toFixed(2)),
      minScore: sortedScores[0],
      maxScore: sortedScores[sortedScores.length - 1],
      range: parseFloat((maxScore - minScore).toFixed(2))
    },
    segmentation: {
      aboveMedian: {
        count: aboveMedian.length,
        percentage: parseFloat((aboveMedian.length / results.length * 100).toFixed(2)),
        sampleStudents: aboveMedian.slice(0, 10).map(s => ({
          studentId: s.studentId,
          studentName: s.studentName,
          totalScore: parseFloat(s.totalScore.toFixed(2))
        }))
      },
      belowMedian: {
        count: belowMedian.length,
        percentage: parseFloat((belowMedian.length / results.length * 100).toFixed(2)),
        sampleStudents: belowMedian.slice(0, 10).map(s => ({
          studentId: s.studentId,
          studentName: s.studentName,
          totalScore: parseFloat(s.totalScore.toFixed(2))
        }))
      },
      equalMedian: {
        count: equalMedian.length,
        percentage: parseFloat((equalMedian.length / results.length * 100).toFixed(2))
      }
    },
    scoreDistribution: distribution,
    normalCurveData: {
      // Points for drawing a normal distribution curve
      mean: parseFloat(mean.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      // Theoretical distribution percentages
      withinOneStdDev: {
        expected: 68.27,
        min: parseFloat((mean - stdDev).toFixed(2)),
        max: parseFloat((mean + stdDev).toFixed(2))
      },
      withinTwoStdDev: {
        expected: 95.45,
        min: parseFloat((mean - 2 * stdDev).toFixed(2)),
        max: parseFloat((mean + 2 * stdDev).toFixed(2))
      },
      withinThreeStdDev: {
        expected: 99.73,
        min: parseFloat((mean - 3 * stdDev).toFixed(2)),
        max: parseFloat((mean + 3 * stdDev).toFixed(2))
      }
    }
  };
};

module.exports = {
  getDistributionByComponent,
  getAvailableComponents,
  getComparativeAnalysis,
  getMedianDistribution
};
