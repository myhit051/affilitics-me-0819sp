// AI Trend Detection and Alert Service
// Implements basic trend detection using existing dailyMetrics data and generates alerts

import { AIAnalysisData, AIAlert } from '@/types/ai';
import { DailyMetrics } from '@/utils/affiliateCalculations';

export interface TrendAnalysisResult {
  trends: TrendDetection[];
  alerts: AIAlert[];
  overallTrend: 'improving' | 'declining' | 'stable';
  trendStrength: number; // 0-100, how strong the trend is
  confidenceScore: number;
}

export interface TrendDetection {
  metric: string;
  trend: 'improving' | 'declining' | 'stable';
  strength: number; // 0-100
  changePercentage: number;
  significance: 'high' | 'medium' | 'low';
  timeframe: number; // days analyzed
  description: string;
}

export interface AlertConfiguration {
  roiChangeThreshold: number; // Percentage change to trigger alert
  revenueChangeThreshold: number; // Percentage change to trigger alert
  ordersChangeThreshold: number; // Percentage change to trigger alert
  minDataPoints: number; // Minimum data points needed for reliable alerts
  lookbackPeriod: number; // Days to look back for comparison
}

class AITrendDetector {
  private readonly DEFAULT_CONFIG: AlertConfiguration = {
    roiChangeThreshold: 20, // 20% change triggers alert
    revenueChangeThreshold: 25, // 25% change triggers alert
    ordersChangeThreshold: 30, // 30% change triggers alert
    minDataPoints: 7, // Need at least 7 days of data
    lookbackPeriod: 7 // Compare last 3 days vs previous 4 days
  };

  /**
   * Detect trends in daily metrics data
   */
  detectTrends(data: AIAnalysisData, config?: Partial<AlertConfiguration>): TrendAnalysisResult {
    console.log('🤖 AI Trend Detector: Analyzing trends in daily metrics');
    
    const effectiveConfig = { ...this.DEFAULT_CONFIG, ...config };
    const dailyMetrics = data.dailyMetrics;
    
    if (dailyMetrics.length < effectiveConfig.minDataPoints) {
      return {
        trends: [],
        alerts: [],
        overallTrend: 'stable',
        trendStrength: 0,
        confidenceScore: 20
      };
    }

    // Detect trends for key metrics
    const trends: TrendDetection[] = [
      this.detectROITrend(dailyMetrics, effectiveConfig),
      this.detectRevenueTrend(dailyMetrics, effectiveConfig),
      this.detectOrdersTrend(dailyMetrics, effectiveConfig),
      this.detectProfitTrend(dailyMetrics, effectiveConfig),
      this.detectAdSpendTrend(dailyMetrics, effectiveConfig)
    ].filter(trend => trend !== null) as TrendDetection[];

    // Generate alerts based on trends
    const alerts = this.generateTrendAlerts(trends, data, effectiveConfig);

    // Calculate overall trend
    const overallTrend = this.calculateOverallTrend(trends);
    const trendStrength = this.calculateTrendStrength(trends);
    const confidenceScore = this.calculateTrendConfidence(dailyMetrics.length, trends);

    return {
      trends,
      alerts,
      overallTrend,
      trendStrength,
      confidenceScore
    };
  }

  /**
   * Generate performance change alerts
   */
  generatePerformanceAlerts(data: AIAnalysisData, config?: Partial<AlertConfiguration>): AIAlert[] {
    console.log('🤖 AI Trend Detector: Generating performance alerts');
    
    const effectiveConfig = { ...this.DEFAULT_CONFIG, ...config };
    const alerts: AIAlert[] = [];
    const dailyMetrics = data.dailyMetrics;
    
    if (dailyMetrics.length < effectiveConfig.minDataPoints) {
      return alerts;
    }

    // ROI performance alerts
    const roiAlert = this.checkROIPerformance(dailyMetrics, data.calculatedMetrics, effectiveConfig);
    if (roiAlert) alerts.push(roiAlert);

    // Revenue performance alerts
    const revenueAlert = this.checkRevenuePerformance(dailyMetrics, data.calculatedMetrics, effectiveConfig);
    if (revenueAlert) alerts.push(revenueAlert);

    // Order volume alerts
    const ordersAlert = this.checkOrdersPerformance(dailyMetrics, data.calculatedMetrics, effectiveConfig);
    if (ordersAlert) alerts.push(ordersAlert);

    // Ad spend efficiency alerts
    const adSpendAlert = this.checkAdSpendEfficiency(dailyMetrics, data.calculatedMetrics, effectiveConfig);
    if (adSpendAlert) alerts.push(adSpendAlert);

    // Data quality alerts
    const dataQualityAlert = this.checkDataQuality(data, effectiveConfig);
    if (dataQualityAlert) alerts.push(dataQualityAlert);

    return alerts;
  }

  /**
   * Categorize alerts by type and severity
   */
  categorizeAlerts(alerts: AIAlert[]): {
    opportunities: AIAlert[];
    warnings: AIAlert[];
    critical: AIAlert[];
  } {
    return {
      opportunities: alerts.filter(a => a.type === 'opportunity'),
      warnings: alerts.filter(a => a.type === 'warning'),
      critical: alerts.filter(a => a.type === 'critical')
    };
  }

  /**
   * Calculate trend significance based on statistical analysis
   */
  calculateTrendSignificance(values: number[], timeframe: number): 'high' | 'medium' | 'low' {
    if (values.length < 5 || timeframe < 7) return 'low';
    
    const slope = this.calculateLinearTrend(values);
    const variance = this.calculateVariance(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate coefficient of variation
    const coefficientOfVariation = variance / Math.abs(mean);
    
    // Strong trend with low variance
    if (Math.abs(slope) > 2 && coefficientOfVariation < 0.3) return 'high';
    
    // Moderate trend
    if (Math.abs(slope) > 1 || coefficientOfVariation < 0.5) return 'medium';
    
    return 'low';
  }

  // Private helper methods

  private detectROITrend(dailyMetrics: DailyMetrics[], config: AlertConfiguration): TrendDetection | null {
    const roiValues = dailyMetrics.map(d => d.roi);
    const slope = this.calculateLinearTrend(roiValues);
    const changePercentage = this.calculatePercentageChange(roiValues);
    
    let trend: 'improving' | 'declining' | 'stable';
    if (slope > 1) trend = 'improving';
    else if (slope < -1) trend = 'declining';
    else trend = 'stable';

    const strength = Math.min(100, Math.abs(slope) * 10);
    const significance = this.calculateTrendSignificance(roiValues, dailyMetrics.length);

    return {
      metric: 'ROI',
      trend,
      strength,
      changePercentage,
      significance,
      timeframe: dailyMetrics.length,
      description: `ROI trend is ${trend} with ${changePercentage.toFixed(1)}% change over ${dailyMetrics.length} days`
    };
  }

  private detectRevenueTrend(dailyMetrics: DailyMetrics[], config: AlertConfiguration): TrendDetection | null {
    const revenueValues = dailyMetrics.map(d => d.totalCom);
    const slope = this.calculateLinearTrend(revenueValues);
    const changePercentage = this.calculatePercentageChange(revenueValues);
    
    let trend: 'improving' | 'declining' | 'stable';
    if (slope > 10) trend = 'improving';
    else if (slope < -10) trend = 'declining';
    else trend = 'stable';

    const strength = Math.min(100, Math.abs(slope) / 10);
    const significance = this.calculateTrendSignificance(revenueValues, dailyMetrics.length);

    return {
      metric: 'Revenue',
      trend,
      strength,
      changePercentage,
      significance,
      timeframe: dailyMetrics.length,
      description: `Revenue trend is ${trend} with ${changePercentage.toFixed(1)}% change over ${dailyMetrics.length} days`
    };
  }

  private detectOrdersTrend(dailyMetrics: DailyMetrics[], config: AlertConfiguration): TrendDetection | null {
    const ordersValues = dailyMetrics.map(d => (d.ordersSP || 0) + (d.ordersLZD || 0));
    const slope = this.calculateLinearTrend(ordersValues);
    const changePercentage = this.calculatePercentageChange(ordersValues);
    
    let trend: 'improving' | 'declining' | 'stable';
    if (slope > 0.5) trend = 'improving';
    else if (slope < -0.5) trend = 'declining';
    else trend = 'stable';

    const strength = Math.min(100, Math.abs(slope) * 20);
    const significance = this.calculateTrendSignificance(ordersValues, dailyMetrics.length);

    return {
      metric: 'Orders',
      trend,
      strength,
      changePercentage,
      significance,
      timeframe: dailyMetrics.length,
      description: `Orders trend is ${trend} with ${changePercentage.toFixed(1)}% change over ${dailyMetrics.length} days`
    };
  }

  private detectProfitTrend(dailyMetrics: DailyMetrics[], config: AlertConfiguration): TrendDetection | null {
    const profitValues = dailyMetrics.map(d => d.profit);
    const slope = this.calculateLinearTrend(profitValues);
    const changePercentage = this.calculatePercentageChange(profitValues);
    
    let trend: 'improving' | 'declining' | 'stable';
    if (slope > 5) trend = 'improving';
    else if (slope < -5) trend = 'declining';
    else trend = 'stable';

    const strength = Math.min(100, Math.abs(slope) / 5);
    const significance = this.calculateTrendSignificance(profitValues, dailyMetrics.length);

    return {
      metric: 'Profit',
      trend,
      strength,
      changePercentage,
      significance,
      timeframe: dailyMetrics.length,
      description: `Profit trend is ${trend} with ${changePercentage.toFixed(1)}% change over ${dailyMetrics.length} days`
    };
  }

  private detectAdSpendTrend(dailyMetrics: DailyMetrics[], config: AlertConfiguration): TrendDetection | null {
    const adSpendValues = dailyMetrics.map(d => d.adSpend);
    const slope = this.calculateLinearTrend(adSpendValues);
    const changePercentage = this.calculatePercentageChange(adSpendValues);
    
    let trend: 'improving' | 'declining' | 'stable';
    if (slope > 10) trend = 'declining'; // Increasing ad spend is declining efficiency
    else if (slope < -10) trend = 'improving'; // Decreasing ad spend is improving efficiency
    else trend = 'stable';

    const strength = Math.min(100, Math.abs(slope) / 10);
    const significance = this.calculateTrendSignificance(adSpendValues, dailyMetrics.length);

    return {
      metric: 'Ad Spend',
      trend,
      strength,
      changePercentage,
      significance,
      timeframe: dailyMetrics.length,
      description: `Ad spend trend shows ${changePercentage.toFixed(1)}% change over ${dailyMetrics.length} days`
    };
  }

  private generateTrendAlerts(trends: TrendDetection[], data: AIAnalysisData, config: AlertConfiguration): AIAlert[] {
    const alerts: AIAlert[] = [];

    trends.forEach(trend => {
      if (trend.significance === 'high' && Math.abs(trend.changePercentage) > 20) {
        const alertType = trend.trend === 'improving' ? 'opportunity' : 
                         Math.abs(trend.changePercentage) > 40 ? 'critical' : 'warning';
        
        const severity = trend.significance === 'high' ? 'high' : 
                        trend.significance === 'medium' ? 'medium' : 'low';

        alerts.push({
          id: this.generateId(),
          type: alertType,
          title: `${trend.metric} Trend Alert`,
          description: trend.description,
          severity,
          affectedMetric: trend.metric,
          currentValue: this.getCurrentMetricValue(trend.metric, data),
          threshold: config.roiChangeThreshold, // Use appropriate threshold based on metric
          recommendations: this.generateTrendRecommendations(trend),
          createdAt: new Date(),
          isRead: false,
          isDismissed: false
        });
      }
    });

    return alerts;
  }

  private checkROIPerformance(dailyMetrics: DailyMetrics[], calculatedMetrics: any, config: AlertConfiguration): AIAlert | null {
    if (dailyMetrics.length < config.lookbackPeriod) return null;

    const recentPeriod = Math.min(3, Math.floor(dailyMetrics.length / 2));
    const previousPeriod = Math.min(config.lookbackPeriod - recentPeriod, dailyMetrics.length - recentPeriod);
    
    if (previousPeriod <= 0) return null;
    
    const recentROI = dailyMetrics.slice(-recentPeriod).reduce((sum, d) => sum + d.roi, 0) / recentPeriod;
    const previousROI = dailyMetrics.slice(-config.lookbackPeriod, -recentPeriod).reduce((sum, d) => sum + d.roi, 0) / previousPeriod;
    
    const changePercentage = previousROI > 0 ? ((recentROI - previousROI) / previousROI) * 100 : 0;

    if (Math.abs(changePercentage) > config.roiChangeThreshold) {
      const isImproving = changePercentage > 0;
      
      return {
        id: this.generateId(),
        type: isImproving ? 'opportunity' : changePercentage < -40 ? 'critical' : 'warning',
        title: `ROI Performance ${isImproving ? 'Improvement' : 'Decline'} Detected`,
        description: `ROI has ${isImproving ? 'improved' : 'declined'} by ${Math.abs(changePercentage).toFixed(1)}% in recent days`,
        severity: Math.abs(changePercentage) > 40 ? 'high' : Math.abs(changePercentage) > 25 ? 'medium' : 'low',
        affectedMetric: 'ROI',
        currentValue: recentROI,
        expectedValue: previousROI,
        threshold: config.roiChangeThreshold,
        recommendations: isImproving 
          ? ['Scale successful campaigns', 'Analyze winning strategies', 'Increase budget allocation']
          : ['Review recent campaign changes', 'Pause underperforming campaigns', 'Optimize targeting and creatives'],
        createdAt: new Date(),
        isRead: false,
        isDismissed: false
      };
    }

    return null;
  }

  private checkRevenuePerformance(dailyMetrics: DailyMetrics[], calculatedMetrics: any, config: AlertConfiguration): AIAlert | null {
    if (dailyMetrics.length < config.lookbackPeriod) return null;

    const recentPeriod = Math.min(3, Math.floor(dailyMetrics.length / 2));
    const previousPeriod = Math.min(config.lookbackPeriod - recentPeriod, dailyMetrics.length - recentPeriod);
    
    if (previousPeriod <= 0) return null;
    
    const recentRevenue = dailyMetrics.slice(-recentPeriod).reduce((sum, d) => sum + d.totalCom, 0) / recentPeriod;
    const previousRevenue = dailyMetrics.slice(-config.lookbackPeriod, -recentPeriod).reduce((sum, d) => sum + d.totalCom, 0) / previousPeriod;
    
    const changePercentage = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    if (Math.abs(changePercentage) > config.revenueChangeThreshold) {
      const isImproving = changePercentage > 0;
      
      return {
        id: this.generateId(),
        type: isImproving ? 'opportunity' : 'warning',
        title: `Revenue ${isImproving ? 'Growth' : 'Decline'} Alert`,
        description: `Daily revenue has ${isImproving ? 'increased' : 'decreased'} by ${Math.abs(changePercentage).toFixed(1)}%`,
        severity: Math.abs(changePercentage) > 50 ? 'high' : 'medium',
        affectedMetric: 'Revenue',
        currentValue: recentRevenue,
        expectedValue: previousRevenue,
        threshold: config.revenueChangeThreshold,
        recommendations: isImproving 
          ? ['Scale successful campaigns', 'Expand to similar audiences', 'Increase daily budgets']
          : ['Investigate revenue drop causes', 'Review conversion tracking', 'Check for external factors'],
        createdAt: new Date(),
        isRead: false,
        isDismissed: false
      };
    }

    return null;
  }

  private checkOrdersPerformance(dailyMetrics: DailyMetrics[], calculatedMetrics: any, config: AlertConfiguration): AIAlert | null {
    if (dailyMetrics.length < config.lookbackPeriod) return null;

    const recentPeriod = Math.min(3, Math.floor(dailyMetrics.length / 2));
    const previousPeriod = Math.min(config.lookbackPeriod - recentPeriod, dailyMetrics.length - recentPeriod);
    
    if (previousPeriod <= 0) return null;
    
    const recentOrders = dailyMetrics.slice(-recentPeriod).reduce((sum, d) => sum + (d.ordersSP || 0) + (d.ordersLZD || 0), 0) / recentPeriod;
    const previousOrders = dailyMetrics.slice(-config.lookbackPeriod, -recentPeriod).reduce((sum, d) => sum + (d.ordersSP || 0) + (d.ordersLZD || 0), 0) / previousPeriod;
    
    const changePercentage = previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0;

    if (Math.abs(changePercentage) > config.ordersChangeThreshold) {
      const isImproving = changePercentage > 0;
      
      return {
        id: this.generateId(),
        type: isImproving ? 'opportunity' : 'warning',
        title: `Order Volume ${isImproving ? 'Increase' : 'Decrease'} Alert`,
        description: `Daily orders have ${isImproving ? 'increased' : 'decreased'} by ${Math.abs(changePercentage).toFixed(1)}%`,
        severity: Math.abs(changePercentage) > 50 ? 'high' : 'medium',
        affectedMetric: 'Orders',
        currentValue: recentOrders,
        expectedValue: previousOrders,
        threshold: config.ordersChangeThreshold,
        recommendations: isImproving 
          ? ['Maintain current strategy', 'Consider scaling budget', 'Analyze successful elements']
          : ['Review campaign performance', 'Check for technical issues', 'Optimize conversion funnel'],
        createdAt: new Date(),
        isRead: false,
        isDismissed: false
      };
    }

    return null;
  }

  private checkAdSpendEfficiency(dailyMetrics: DailyMetrics[], calculatedMetrics: any, config: AlertConfiguration): AIAlert | null {
    if (dailyMetrics.length < config.lookbackPeriod) return null;

    const recentPeriod = Math.min(3, Math.floor(dailyMetrics.length / 2));
    const previousPeriod = Math.min(config.lookbackPeriod - recentPeriod, dailyMetrics.length - recentPeriod);
    
    if (previousPeriod <= 0) return null;
    
    const recentEfficiency = dailyMetrics.slice(-recentPeriod).map(d => d.adSpend > 0 ? d.totalCom / d.adSpend : 0);
    const previousEfficiency = dailyMetrics.slice(-config.lookbackPeriod, -recentPeriod).map(d => d.adSpend > 0 ? d.totalCom / d.adSpend : 0);
    
    const recentAvg = recentEfficiency.reduce((sum, e) => sum + e, 0) / recentEfficiency.length;
    const previousAvg = previousEfficiency.reduce((sum, e) => sum + e, 0) / previousEfficiency.length;
    
    const changePercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    if (Math.abs(changePercentage) > 20) {
      const isImproving = changePercentage > 0;
      
      return {
        id: this.generateId(),
        type: isImproving ? 'opportunity' : 'warning',
        title: `Ad Spend Efficiency ${isImproving ? 'Improvement' : 'Decline'}`,
        description: `Revenue per dollar spent has ${isImproving ? 'improved' : 'declined'} by ${Math.abs(changePercentage).toFixed(1)}%`,
        severity: Math.abs(changePercentage) > 35 ? 'high' : 'medium',
        affectedMetric: 'Ad Spend Efficiency',
        currentValue: recentAvg,
        expectedValue: previousAvg,
        threshold: 20,
        recommendations: isImproving 
          ? ['Scale efficient campaigns', 'Apply successful strategies to other campaigns', 'Increase budget for high-efficiency Sub IDs']
          : ['Review recent campaign changes', 'Optimize targeting and bidding', 'Pause inefficient campaigns'],
        createdAt: new Date(),
        isRead: false,
        isDismissed: false
      };
    }

    return null;
  }

  private checkDataQuality(data: AIAnalysisData, config: AlertConfiguration): AIAlert | null {
    const issues: string[] = [];
    
    // Check data freshness
    if (data.dailyMetrics.length > 0) {
      const lastDataDate = new Date(data.dailyMetrics[data.dailyMetrics.length - 1].date);
      const daysSinceLastData = Math.floor((Date.now() - lastDataDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastData > 3) {
        issues.push(`Data is ${daysSinceLastData} days old`);
      }
    }
    
    // Check data completeness
    const totalRecords = data.shopeeOrders.length + data.lazadaOrders.length + data.facebookAds.length;
    if (totalRecords < 50) {
      issues.push('Limited data volume may affect analysis accuracy');
    }
    
    // Check for missing Sub IDs
    if (data.subIds.length < 3) {
      issues.push('Few Sub IDs detected - consider improving Sub ID tracking');
    }

    if (issues.length > 0) {
      return {
        id: this.generateId(),
        type: 'warning',
        title: 'Data Quality Issues Detected',
        description: `${issues.length} data quality issues found that may affect analysis accuracy`,
        severity: 'medium',
        affectedMetric: 'Data Quality',
        currentValue: 100 - (issues.length * 20),
        threshold: 80,
        recommendations: [
          'Import recent data to improve freshness',
          'Ensure Sub ID tracking is properly configured',
          'Verify data import processes are working correctly'
        ],
        createdAt: new Date(),
        isRead: false,
        isDismissed: false
      };
    }

    return null;
  }

  private calculateOverallTrend(trends: TrendDetection[]): 'improving' | 'declining' | 'stable' {
    if (trends.length === 0) return 'stable';
    
    const improvingCount = trends.filter(t => t.trend === 'improving').length;
    const decliningCount = trends.filter(t => t.trend === 'declining').length;
    
    if (improvingCount > decliningCount) return 'improving';
    if (decliningCount > improvingCount) return 'declining';
    return 'stable';
  }

  private calculateTrendStrength(trends: TrendDetection[]): number {
    if (trends.length === 0) return 0;
    
    const avgStrength = trends.reduce((sum, t) => sum + t.strength, 0) / trends.length;
    return Math.min(100, avgStrength);
  }

  private calculateTrendConfidence(dataPoints: number, trends: TrendDetection[]): number {
    let confidence = 50; // Base confidence
    
    // More data points increase confidence
    if (dataPoints >= 30) confidence += 20;
    else if (dataPoints >= 14) confidence += 15;
    else if (dataPoints >= 7) confidence += 10;
    
    // Consistent trends across metrics increase confidence
    const highSignificanceTrends = trends.filter(t => t.significance === 'high').length;
    confidence += highSignificanceTrends * 5;
    
    // Penalty for very limited data
    if (dataPoints < 5) confidence -= 20;
    
    return Math.min(95, Math.max(30, confidence));
  }

  private getCurrentMetricValue(metric: string, data: AIAnalysisData): number {
    const lastDay = data.dailyMetrics[data.dailyMetrics.length - 1];
    if (!lastDay) return 0;
    
    switch (metric) {
      case 'ROI': return lastDay.roi;
      case 'Revenue': return lastDay.totalCom;
      case 'Orders': return (lastDay.ordersSP || 0) + (lastDay.ordersLZD || 0);
      case 'Profit': return lastDay.profit;
      case 'Ad Spend': return lastDay.adSpend;
      default: return 0;
    }
  }

  private generateTrendRecommendations(trend: TrendDetection): string[] {
    const recommendations: string[] = [];
    
    if (trend.trend === 'improving') {
      recommendations.push(`Continue current strategies for ${trend.metric}`);
      recommendations.push(`Consider scaling successful campaigns`);
      if (trend.strength > 70) {
        recommendations.push(`Strong ${trend.metric} trend - increase budget allocation`);
      }
    } else if (trend.trend === 'declining') {
      recommendations.push(`Investigate causes of ${trend.metric} decline`);
      recommendations.push(`Review recent changes to campaigns`);
      if (trend.strength > 70) {
        recommendations.push(`Urgent: Address significant ${trend.metric} decline`);
      }
    } else {
      recommendations.push(`Monitor ${trend.metric} for changes`);
      recommendations.push(`Consider optimization opportunities`);
    }
    
    return recommendations;
  }

  // Statistical helper methods

  private calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  private calculatePercentageChange(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    
    if (firstValue === 0) return 0;
    
    return ((lastValue - firstValue) / firstValue) * 100;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private generateId(): string {
    return `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiTrendDetector = new AITrendDetector();