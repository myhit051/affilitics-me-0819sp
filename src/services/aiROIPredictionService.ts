// AI ROI Prediction Service
// Implements basic linear trend prediction for 7-30 day ROI forecasting

import { DailyMetrics } from '@/utils/affiliateCalculations';
import { AIPrediction, AIPredictionFactor, AIAnalysisData } from '@/types/ai';

export interface ROIPredictionConfig {
  minDataPoints: number;
  maxPredictionDays: number;
  confidenceThreshold: number;
  volatilityThreshold: number;
}

export interface ROIPredictionResult {
  predictions: AIPrediction[];
  confidence: number;
  riskAssessment: 'low' | 'medium' | 'high';
  dataQuality: {
    sufficiency: number; // 0-100
    consistency: number; // 0-100
    trend: 'improving' | 'declining' | 'stable';
  };
  recommendations: string[];
}

class AIROIPredictionService {
  private config: ROIPredictionConfig = {
    minDataPoints: 7,
    maxPredictionDays: 30,
    confidenceThreshold: 60,
    volatilityThreshold: 0.3
  };

  /**
   * Generate ROI predictions for specified timeframes
   */
  async predictROI(
    data: AIAnalysisData,
    timeframes: number[] = [7, 14, 30]
  ): Promise<ROIPredictionResult> {
    console.log('🔮 AI ROI Prediction: Starting prediction analysis');

    // Validate input data
    const validation = this.validatePredictionData(data);
    if (!validation.isValid) {
      throw new Error(`Insufficient data for prediction: ${validation.errors.join(', ')}`);
    }

    const dailyMetrics = data.dailyMetrics;
    const predictions: AIPrediction[] = [];

    // Generate predictions for each timeframe
    for (const days of timeframes) {
      if (days <= this.config.maxPredictionDays) {
        const prediction = await this.generateROIPrediction(dailyMetrics, days);
        predictions.push(prediction);
      }
    }

    // Calculate overall confidence and risk assessment
    const overallConfidence = this.calculateOverallConfidence(predictions);
    const riskAssessment = this.assessOverallRisk(dailyMetrics, predictions);
    const dataQuality = this.assessDataQuality(dailyMetrics);
    const recommendations = this.generateRecommendations(predictions, dataQuality);

    console.log('🔮 AI ROI Prediction: Completed analysis', {
      predictionsGenerated: predictions.length,
      overallConfidence,
      riskAssessment,
      dataQuality
    });

    return {
      predictions,
      confidence: overallConfidence,
      riskAssessment,
      dataQuality,
      recommendations
    };
  }

  /**
   * Generate single ROI prediction for specific timeframe
   */
  private async generateROIPrediction(
    dailyMetrics: DailyMetrics[],
    days: number
  ): Promise<AIPrediction> {
    // Sort metrics by date to ensure chronological order
    const sortedMetrics = [...dailyMetrics].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract ROI values for trend analysis
    const roiValues = sortedMetrics.map(metric => metric.roi);
    
    // Calculate linear trend
    const trendAnalysis = this.calculateLinearTrend(roiValues);
    
    // Predict future ROI based on trend
    const predictedROI = this.extrapolateTrend(trendAnalysis, days);
    
    // Calculate confidence intervals based on historical variance
    const confidenceInterval = this.calculateConfidenceInterval(
      roiValues, 
      predictedROI, 
      days
    );
    
    // Assess risk level based on volatility
    const riskLevel = this.assessRiskLevel(roiValues, days);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      roiValues, 
      trendAnalysis, 
      days
    );
    
    // Identify prediction factors
    const factors = this.identifyPredictionFactors(sortedMetrics, trendAnalysis);

    return {
      id: `roi_prediction_${days}d_${Date.now()}`,
      type: 'roi',
      timeframe: days,
      predictedValue: Math.round(predictedROI * 100) / 100,
      confidenceInterval: {
        lower: Math.round(confidenceInterval.lower * 100) / 100,
        upper: Math.round(confidenceInterval.upper * 100) / 100
      },
      confidenceScore: Math.round(confidenceScore),
      riskLevel,
      factors,
      createdAt: new Date()
    };
  }

  /**
   * Calculate linear trend using least squares method
   */
  private calculateLinearTrend(values: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    const n = values.length;
    if (n < 2) {
      return { slope: 0, intercept: values[0] || 0, rSquared: 0, trend: 'stable' };
    }

    // Calculate means
    const xMean = (n - 1) / 2; // Since x values are 0, 1, 2, ..., n-1
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = values[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Calculate R-squared
    let totalSumSquares = 0;
    let residualSumSquares = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * i + intercept;
      const actual = values[i];
      totalSumSquares += Math.pow(actual - yMean, 2);
      residualSumSquares += Math.pow(actual - predicted, 2);
    }

    const rSquared = totalSumSquares !== 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

    // Determine trend direction
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (Math.abs(slope) > 0.5) { // Threshold for significant trend
      trend = slope > 0 ? 'improving' : 'declining';
    }

    return { slope, intercept, rSquared, trend };
  }

  /**
   * Extrapolate trend to predict future value
   */
  private extrapolateTrend(
    trendAnalysis: { slope: number; intercept: number; rSquared: number },
    days: number
  ): number {
    const { slope, intercept } = trendAnalysis;
    
    // Project trend forward by the specified number of days
    const futureX = days; // Assuming daily data points
    const predictedValue = slope * futureX + intercept;
    
    // Apply dampening factor for longer predictions to account for uncertainty
    const dampeningFactor = Math.max(0.5, 1 - (days / 60)); // Reduce confidence for longer predictions
    const dampenedPrediction = predictedValue * dampeningFactor;
    
    return Math.max(0, dampenedPrediction); // Ensure non-negative ROI
  }

  /**
   * Calculate confidence interval based on historical variance
   */
  private calculateConfidenceInterval(
    historicalValues: number[],
    predictedValue: number,
    days: number
  ): { lower: number; upper: number } {
    if (historicalValues.length < 2) {
      return { lower: predictedValue * 0.8, upper: predictedValue * 1.2 };
    }

    // Calculate standard deviation
    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (historicalValues.length - 1);
    const standardDeviation = Math.sqrt(variance);

    // Increase uncertainty for longer predictions
    const uncertaintyMultiplier = 1 + (days / 30) * 0.5; // 50% more uncertainty for 30-day predictions
    const adjustedStdDev = standardDeviation * uncertaintyMultiplier;

    // Use 1.96 for 95% confidence interval
    const marginOfError = 1.96 * adjustedStdDev;

    return {
      lower: Math.max(0, predictedValue - marginOfError),
      upper: predictedValue + marginOfError
    };
  }

  /**
   * Assess risk level based on performance volatility
   */
  private assessRiskLevel(
    historicalValues: number[],
    days: number
  ): 'low' | 'medium' | 'high' {
    if (historicalValues.length < 2) return 'high';

    // Calculate coefficient of variation (CV)
    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (historicalValues.length - 1);
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? standardDeviation / Math.abs(mean) : 1;

    // Adjust risk based on prediction timeframe
    const timeframeFactor = days / 30; // Longer predictions are riskier
    const adjustedCV = coefficientOfVariation * (1 + timeframeFactor);

    // Classify risk level
    if (adjustedCV < this.config.volatilityThreshold) return 'low';
    if (adjustedCV < this.config.volatilityThreshold * 2) return 'medium';
    return 'high';
  }

  /**
   * Calculate confidence score for prediction
   */
  private calculateConfidenceScore(
    historicalValues: number[],
    trendAnalysis: { rSquared: number },
    days: number
  ): number {
    // Base confidence on data quality factors
    const dataPointsFactor = Math.min(1, historicalValues.length / 14); // More data = higher confidence
    const trendFitFactor = Math.max(0.3, trendAnalysis.rSquared); // Better trend fit = higher confidence
    const timeframeFactor = Math.max(0.5, 1 - (days / 60)); // Shorter predictions = higher confidence
    
    // Calculate volatility factor
    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (historicalValues.length - 1);
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? standardDeviation / Math.abs(mean) : 1;
    const volatilityFactor = Math.max(0.3, 1 - coefficientOfVariation);

    // Combine factors
    const rawScore = (dataPointsFactor * 0.3 + trendFitFactor * 0.3 + timeframeFactor * 0.2 + volatilityFactor * 0.2) * 100;
    
    return Math.max(30, Math.min(95, rawScore)); // Clamp between 30-95%
  }

  /**
   * Identify factors affecting the prediction
   */
  private identifyPredictionFactors(
    sortedMetrics: DailyMetrics[],
    trendAnalysis: { slope: number; trend: string }
  ): AIPredictionFactor[] {
    const factors: AIPredictionFactor[] = [];

    // Trend factor
    factors.push({
      name: 'Historical Trend',
      impact: Math.min(50, Math.abs(trendAnalysis.slope) * 10),
      description: `ROI trend is ${trendAnalysis.trend} based on recent performance`,
      confidence: 80
    });

    // Recent performance factor
    if (sortedMetrics.length >= 7) {
      const recentMetrics = sortedMetrics.slice(-7);
      const recentAvgROI = recentMetrics.reduce((sum, m) => sum + m.roi, 0) / recentMetrics.length;
      const overallAvgROI = sortedMetrics.reduce((sum, m) => sum + m.roi, 0) / sortedMetrics.length;
      
      const recentPerformanceImpact = ((recentAvgROI - overallAvgROI) / overallAvgROI) * 100;
      
      factors.push({
        name: 'Recent Performance',
        impact: Math.max(-30, Math.min(30, recentPerformanceImpact)),
        description: recentPerformanceImpact > 0 
          ? 'Recent performance is above average' 
          : 'Recent performance is below average',
        confidence: 75
      });
    }

    // Volatility factor
    const roiValues = sortedMetrics.map(m => m.roi);
    const mean = roiValues.reduce((sum, val) => sum + val, 0) / roiValues.length;
    const variance = roiValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (roiValues.length - 1);
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? standardDeviation / Math.abs(mean) : 1;

    factors.push({
      name: 'Performance Volatility',
      impact: Math.min(-10, -coefficientOfVariation * 20),
      description: coefficientOfVariation > 0.3 
        ? 'High volatility increases prediction uncertainty' 
        : 'Low volatility supports stable predictions',
      confidence: 70
    });

    // Data sufficiency factor
    const dataSufficiencyImpact = Math.min(20, (sortedMetrics.length / 30) * 20);
    factors.push({
      name: 'Data Sufficiency',
      impact: dataSufficiencyImpact,
      description: sortedMetrics.length >= 14 
        ? 'Sufficient historical data for reliable predictions' 
        : 'Limited historical data may affect prediction accuracy',
      confidence: 85
    });

    return factors;
  }

  /**
   * Validate data sufficiency for prediction
   */
  private validatePredictionData(data: AIAnalysisData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.dailyMetrics || data.dailyMetrics.length === 0) {
      errors.push('No daily metrics available for prediction');
    } else if (data.dailyMetrics.length < this.config.minDataPoints) {
      errors.push(`Insufficient data points: ${data.dailyMetrics.length} available, ${this.config.minDataPoints} required`);
    }

    // Check for valid ROI values
    const validROICount = data.dailyMetrics?.filter(metric => 
      !isNaN(metric.roi) && isFinite(metric.roi)
    ).length || 0;

    if (validROICount < this.config.minDataPoints) {
      errors.push(`Insufficient valid ROI data points: ${validROICount} valid, ${this.config.minDataPoints} required`);
    }

    // Check date range
    if (data.dailyMetrics && data.dailyMetrics.length > 0) {
      const dates = data.dailyMetrics.map(m => new Date(m.date)).sort((a, b) => a.getTime() - b.getTime());
      const daysDiff = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < this.config.minDataPoints - 1) {
        errors.push(`Insufficient date range: ${Math.round(daysDiff)} days available, ${this.config.minDataPoints} days required`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate overall confidence across all predictions
   */
  private calculateOverallConfidence(predictions: AIPrediction[]): number {
    if (predictions.length === 0) return 0;
    
    const totalConfidence = predictions.reduce((sum, pred) => sum + pred.confidenceScore, 0);
    return Math.round(totalConfidence / predictions.length);
  }

  /**
   * Assess overall risk across all predictions
   */
  private assessOverallRisk(
    dailyMetrics: DailyMetrics[],
    predictions: AIPrediction[]
  ): 'low' | 'medium' | 'high' {
    if (predictions.length === 0) return 'high';

    // Count risk levels
    const riskCounts = predictions.reduce((counts, pred) => {
      counts[pred.riskLevel]++;
      return counts;
    }, { low: 0, medium: 0, high: 0 });

    // Determine overall risk
    if (riskCounts.high > predictions.length / 2) return 'high';
    if (riskCounts.medium > predictions.length / 2) return 'medium';
    return 'low';
  }

  /**
   * Assess data quality for predictions
   */
  private assessDataQuality(dailyMetrics: DailyMetrics[]): {
    sufficiency: number;
    consistency: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    const sufficiency = Math.min(100, (dailyMetrics.length / 30) * 100);
    
    // Calculate consistency based on data completeness
    const validDataPoints = dailyMetrics.filter(metric => 
      !isNaN(metric.roi) && isFinite(metric.roi) && 
      !isNaN(metric.totalCom) && isFinite(metric.totalCom)
    ).length;
    const consistency = (validDataPoints / dailyMetrics.length) * 100;

    // Determine trend
    const roiValues = dailyMetrics.map(m => m.roi);
    const trendAnalysis = this.calculateLinearTrend(roiValues);

    return {
      sufficiency: Math.round(sufficiency),
      consistency: Math.round(consistency),
      trend: trendAnalysis.trend
    };
  }

  /**
   * Generate recommendations based on predictions
   */
  private generateRecommendations(
    predictions: AIPrediction[],
    dataQuality: { sufficiency: number; consistency: number; trend: string }
  ): string[] {
    const recommendations: string[] = [];

    // Data quality recommendations
    if (dataQuality.sufficiency < 70) {
      recommendations.push('Import more historical data to improve prediction accuracy');
    }

    if (dataQuality.consistency < 80) {
      recommendations.push('Review data quality - some metrics may be incomplete or invalid');
    }

    // Prediction-based recommendations
    const shortTermPrediction = predictions.find(p => p.timeframe <= 7);
    const longTermPrediction = predictions.find(p => p.timeframe >= 30);

    if (shortTermPrediction && shortTermPrediction.predictedValue < 0) {
      recommendations.push('Short-term ROI prediction is negative - consider pausing or optimizing campaigns');
    }

    if (longTermPrediction && longTermPrediction.riskLevel === 'high') {
      recommendations.push('Long-term predictions have high uncertainty - monitor performance closely');
    }

    // Trend-based recommendations
    if (dataQuality.trend === 'declining') {
      recommendations.push('ROI trend is declining - investigate underperforming campaigns and optimize');
    } else if (dataQuality.trend === 'improving') {
      recommendations.push('ROI trend is improving - consider increasing budget for high-performing campaigns');
    }

    // Confidence-based recommendations
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidenceScore, 0) / predictions.length;
    if (avgConfidence < 60) {
      recommendations.push('Prediction confidence is low - collect more data before making major budget decisions');
    }

    return recommendations;
  }
}

// Export singleton instance
export const aiROIPredictionService = new AIROIPredictionService();