// Mock AI Analysis Service
// Generates realistic recommendations and predictions for development and testing

import {
  AIAnalysisData,
  AIAnalysisResult,
  AIRecommendation,
  AIPrediction,
  AIAlert,
  AIPerformanceInsight,
  AIBudgetOptimization,
  AIBudgetAllocation,
  AIActionItem,
  AIPredictionFactor,
  AIAnalysisService
} from '@/types/ai';

class MockAIAnalysisService implements AIAnalysisService {
  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async analyzePerformance(data: AIAnalysisData): Promise<AIAnalysisResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const recommendations = await this.generateRecommendations(data);
    const predictions = await this.predictMetrics(data, 30);
    const alerts = await this.detectAnomalies(data);
    const insights = await this.getInsights(data);
    const budgetOptimization = await this.optimizeBudget(data);

    return {
      id: this.generateId(),
      analysisType: 'performance',
      status: 'completed',
      progress: 100,
      recommendations,
      predictions,
      alerts,
      insights,
      budgetOptimization,
      metadata: {
        dataPointsAnalyzed: data.shopeeOrders.length + data.lazadaOrders.length + data.facebookAds.length,
        analysisStartTime: new Date(Date.now() - 1500),
        analysisEndTime: new Date(),
        modelVersion: '1.0.0',
        confidence: this.calculateOverallConfidence(data)
      },
      errors: []
    };
  }

  async generateRecommendations(data: AIAnalysisData): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    const metrics = data.calculatedMetrics;

    // Budget optimization recommendation
    if (metrics.roi < 50 && metrics.totalAdsSpent > 1000) {
      recommendations.push({
        id: this.generateId(),
        type: 'budget',
        title: 'Optimize Budget Allocation',
        description: `Current ROI of ${metrics.roi.toFixed(1)}% is below optimal. Reallocate budget to higher-performing Sub IDs.`,
        expectedImpact: 25,
        confidenceScore: 85,
        priority: 'high',
        actionItems: [
          {
            id: this.generateId(),
            description: 'Reduce budget for underperforming Sub IDs by 30%',
            type: 'budget_adjustment',
            currentValue: metrics.totalAdsSpent,
            recommendedValue: metrics.totalAdsSpent * 0.7,
            estimatedImpact: '+15% ROI improvement'
          },
          {
            id: this.generateId(),
            description: 'Increase budget for top 3 performing Sub IDs by 50%',
            type: 'increase_budget',
            estimatedImpact: '+10% additional revenue'
          }
        ],
        estimatedROIImprovement: 25,
        affectedSubIds: data.subIds.slice(0, 3),
        reasoning: 'Analysis shows significant performance variance between Sub IDs. Budget reallocation can improve overall efficiency.',
        dataPoints: data.shopeeOrders.length + data.lazadaOrders.length,
        createdAt: new Date()
      });
    }

    // Platform optimization recommendation
    const shopeeROI = metrics.totalComSP > 0 ? ((metrics.totalComSP - (metrics.totalAdsSpent * 0.6)) / (metrics.totalAdsSpent * 0.6)) * 100 : 0;
    const lazadaROI = metrics.totalComLZD > 0 ? ((metrics.totalComLZD - (metrics.totalAdsSpent * 0.4)) / (metrics.totalAdsSpent * 0.4)) * 100 : 0;

    if (Math.abs(shopeeROI - lazadaROI) > 30) {
      const betterPlatform = shopeeROI > lazadaROI ? 'Shopee' : 'Lazada';
      const worsePerformance = Math.min(shopeeROI, lazadaROI);
      
      recommendations.push({
        id: this.generateId(),
        type: 'platform',
        title: `Focus on ${betterPlatform} Platform`,
        description: `${betterPlatform} is significantly outperforming with ${Math.max(shopeeROI, lazadaROI).toFixed(1)}% ROI vs ${worsePerformance.toFixed(1)}%.`,
        expectedImpact: 20,
        confidenceScore: 78,
        priority: 'medium',
        actionItems: [
          {
            id: this.generateId(),
            description: `Increase ${betterPlatform} campaign budget by 40%`,
            type: 'increase_budget',
            estimatedImpact: '+20% overall ROI'
          },
          {
            id: this.generateId(),
            description: 'Analyze and replicate successful strategies across platforms',
            type: 'optimize_creative',
            estimatedImpact: '+15% cross-platform performance'
          }
        ],
        estimatedROIImprovement: 20,
        affectedPlatforms: [betterPlatform],
        reasoning: `Platform performance analysis reveals ${betterPlatform} has superior conversion rates and cost efficiency.`,
        dataPoints: metrics.totalOrdersSP + metrics.totalOrdersLZD,
        createdAt: new Date()
      });
    }

    // Sub ID performance recommendation
    if (data.subIds.length > 3) {
      recommendations.push({
        id: this.generateId(),
        type: 'subid',
        title: 'Pause Underperforming Sub IDs',
        description: 'Several Sub IDs are generating negative ROI and consuming budget inefficiently.',
        expectedImpact: 15,
        confidenceScore: 72,
        priority: 'medium',
        actionItems: [
          {
            id: this.generateId(),
            description: 'Pause bottom 20% performing Sub IDs',
            type: 'pause_campaign',
            estimatedImpact: '+15% budget efficiency'
          },
          {
            id: this.generateId(),
            description: 'Analyze successful Sub ID patterns for optimization',
            type: 'change_targeting',
            estimatedImpact: '+10% future campaign performance'
          }
        ],
        estimatedROIImprovement: 15,
        affectedSubIds: data.subIds.slice(-2),
        reasoning: 'Performance data indicates significant variance in Sub ID effectiveness. Focusing resources on proven performers will improve overall ROI.',
        dataPoints: data.subIds.length * 10,
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  async predictMetrics(data: AIAnalysisData, timeframe: number): Promise<AIPrediction[]> {
    const predictions: AIPrediction[] = [];
    const metrics = data.calculatedMetrics;
    const dailyAvg = data.dailyMetrics.length > 0 
      ? data.dailyMetrics.reduce((sum, day) => sum + day.roi, 0) / data.dailyMetrics.length 
      : metrics.roi;

    // ROI Prediction
    const roiTrend = this.calculateTrend(data.dailyMetrics.map(d => d.roi));
    const predictedROI = dailyAvg + (roiTrend * timeframe * 0.1);
    const roiVariance = this.calculateVariance(data.dailyMetrics.map(d => d.roi));
    
    predictions.push({
      id: this.generateId(),
      type: 'roi',
      timeframe,
      predictedValue: Math.max(0, predictedROI),
      confidenceInterval: {
        lower: Math.max(0, predictedROI - roiVariance),
        upper: predictedROI + roiVariance
      },
      confidenceScore: Math.min(95, Math.max(60, 90 - (roiVariance * 2))),
      riskLevel: roiVariance > 20 ? 'high' : roiVariance > 10 ? 'medium' : 'low',
      factors: [
        {
          name: 'Historical Performance Trend',
          impact: roiTrend > 0 ? 15 : -10,
          description: roiTrend > 0 ? 'Positive trend in recent performance' : 'Declining performance trend',
          confidence: 85
        },
        {
          name: 'Market Seasonality',
          impact: 5,
          description: 'Seasonal factors may positively impact performance',
          confidence: 70
        },
        {
          name: 'Budget Efficiency',
          impact: metrics.roi > 50 ? 10 : -5,
          description: metrics.roi > 50 ? 'Current campaigns are cost-effective' : 'Budget optimization needed',
          confidence: 80
        }
      ],
      createdAt: new Date()
    });

    // Revenue Prediction
    const avgDailyRevenue = data.dailyMetrics.length > 0
      ? data.dailyMetrics.reduce((sum, day) => sum + day.totalCom, 0) / data.dailyMetrics.length
      : metrics.totalCom / 30;
    
    const predictedRevenue = avgDailyRevenue * timeframe;
    
    predictions.push({
      id: this.generateId(),
      type: 'revenue',
      timeframe,
      predictedValue: predictedRevenue,
      confidenceInterval: {
        lower: predictedRevenue * 0.8,
        upper: predictedRevenue * 1.2
      },
      confidenceScore: 82,
      riskLevel: 'medium',
      factors: [
        {
          name: 'Average Daily Performance',
          impact: 20,
          description: `Based on ${data.dailyMetrics.length} days of historical data`,
          confidence: 90
        },
        {
          name: 'Platform Mix',
          impact: 10,
          description: 'Current platform allocation supports stable revenue',
          confidence: 75
        }
      ],
      createdAt: new Date()
    });

    return predictions;
  }

  async detectAnomalies(data: AIAnalysisData): Promise<AIAlert[]> {
    const alerts: AIAlert[] = [];
    const metrics = data.calculatedMetrics;

    // Low ROI Alert
    if (metrics.roi < 20 && metrics.totalAdsSpent > 500) {
      alerts.push({
        id: this.generateId(),
        type: 'critical',
        title: 'Low ROI Performance',
        description: `Current ROI of ${metrics.roi.toFixed(1)}% is significantly below industry standards.`,
        severity: 'high',
        affectedMetric: 'ROI',
        currentValue: metrics.roi,
        expectedValue: 50,
        threshold: 20,
        recommendations: [
          'Review and pause underperforming campaigns',
          'Optimize targeting and creative elements',
          'Consider budget reallocation to better-performing Sub IDs'
        ],
        createdAt: new Date(),
        isRead: false,
        isDismissed: false
      });
    }

    // High Spend Alert
    if (metrics.totalAdsSpent > metrics.totalCom * 1.5) {
      alerts.push({
        id: this.generateId(),
        type: 'warning',
        title: 'High Ad Spend Detected',
        description: 'Ad spend is exceeding commission income, indicating potential budget inefficiency.',
        severity: 'medium',
        affectedMetric: 'Ad Spend',
        currentValue: metrics.totalAdsSpent,
        expectedValue: metrics.totalCom * 0.8,
        threshold: metrics.totalCom,
        recommendations: [
          'Implement daily budget caps',
          'Review campaign performance metrics',
          'Consider pausing lowest-performing campaigns'
        ],
        createdAt: new Date(),
        isRead: false,
        isDismissed: false
      });
    }

    // Performance Drop Alert
    if (data.dailyMetrics.length >= 7) {
      const recentAvg = data.dailyMetrics.slice(-3).reduce((sum, day) => sum + day.roi, 0) / 3;
      const previousAvg = data.dailyMetrics.slice(-7, -3).reduce((sum, day) => sum + day.roi, 0) / 4;
      
      if (recentAvg < previousAvg * 0.8) {
        alerts.push({
          id: this.generateId(),
          type: 'warning',
          title: 'Performance Decline Detected',
          description: `ROI has dropped ${((1 - recentAvg/previousAvg) * 100).toFixed(1)}% in recent days.`,
          severity: 'medium',
          affectedMetric: 'ROI Trend',
          currentValue: recentAvg,
          expectedValue: previousAvg,
          threshold: previousAvg * 0.9,
          recommendations: [
            'Investigate recent campaign changes',
            'Check for external market factors',
            'Review competitor activity'
          ],
          createdAt: new Date(),
          isRead: false,
          isDismissed: false
        });
      }
    }

    return alerts;
  }

  async getInsights(data: AIAnalysisData): Promise<AIPerformanceInsight[]> {
    const insights: AIPerformanceInsight[] = [];
    const metrics = data.calculatedMetrics;

    // Platform Performance Insight
    const shopeePerformance = metrics.totalOrdersSP > 0 ? metrics.totalComSP / metrics.totalOrdersSP : 0;
    const lazadaPerformance = metrics.totalOrdersLZD > 0 ? metrics.totalComLZD / metrics.totalOrdersLZD : 0;

    if (shopeePerformance > 0 && lazadaPerformance > 0) {
      const betterPlatform = shopeePerformance > lazadaPerformance ? 'Shopee' : 'Lazada';
      const performanceDiff = Math.abs(shopeePerformance - lazadaPerformance);
      
      insights.push({
        id: this.generateId(),
        type: 'benchmark',
        title: 'Platform Performance Comparison',
        description: `${betterPlatform} shows superior performance with ${Math.max(shopeePerformance, lazadaPerformance).toFixed(2)} average commission per order.`,
        insight: `Consider focusing more resources on ${betterPlatform} campaigns while analyzing what makes them more effective.`,
        confidence: 85,
        dataRange: data.dateRange,
        affectedMetrics: ['Commission per Order', 'Platform ROI'],
        createdAt: new Date()
      });
    }

    // Trend Analysis Insight
    if (data.dailyMetrics.length >= 14) {
      const trend = this.calculateTrend(data.dailyMetrics.map(d => d.roi));
      const trendType = trend > 2 ? 'improving' : trend < -2 ? 'declining' : 'stable';
      
      insights.push({
        id: this.generateId(),
        type: 'trend',
        title: `Performance Trend: ${trendType.charAt(0).toUpperCase() + trendType.slice(1)}`,
        description: `ROI trend over the past ${data.dailyMetrics.length} days shows ${trendType} performance.`,
        insight: trendType === 'improving' 
          ? 'Current strategies are working well. Consider scaling successful campaigns.'
          : trendType === 'declining'
          ? 'Performance is declining. Review recent changes and optimize underperforming elements.'
          : 'Performance is stable. Look for optimization opportunities to drive growth.',
        confidence: 78,
        dataRange: data.dateRange,
        affectedMetrics: ['ROI', 'Daily Performance'],
        visualizationData: {
          trend: data.dailyMetrics.map(d => ({ date: d.date, roi: d.roi })),
          trendLine: trend
        },
        createdAt: new Date()
      });
    }

    // Data Quality Insight
    const dataQuality = this.assessDataQuality(data);
    if (dataQuality.score < 80) {
      insights.push({
        id: this.generateId(),
        type: 'anomaly',
        title: 'Data Quality Assessment',
        description: `Data quality score: ${dataQuality.score}%. Some recommendations may have lower confidence.`,
        insight: dataQuality.issues.join(' '),
        confidence: 90,
        dataRange: data.dateRange,
        affectedMetrics: ['All Metrics'],
        createdAt: new Date()
      });
    }

    return insights;
  }

  async optimizeBudget(data: AIAnalysisData): Promise<AIBudgetOptimization> {
    const metrics = data.calculatedMetrics;
    const totalBudget = metrics.totalAdsSpent;
    
    // Mock budget allocation based on performance
    const currentAllocation: AIBudgetAllocation[] = data.subIds.slice(0, 5).map((subId, index) => ({
      subId,
      platform: index % 2 === 0 ? 'Shopee' : 'Lazada',
      currentBudget: totalBudget / data.subIds.length,
      recommendedBudget: 0, // Will be calculated
      expectedROI: 0, // Will be calculated
      confidence: 75 + Math.random() * 20,
      reasoning: ''
    }));

    // Calculate recommended allocation (mock logic)
    const recommendedAllocation: AIBudgetAllocation[] = currentAllocation.map((allocation, index) => {
      const performanceMultiplier = 1 + (Math.random() - 0.5) * 0.6; // -30% to +30%
      const recommendedBudget = allocation.currentBudget * performanceMultiplier;
      const expectedROI = metrics.roi * performanceMultiplier;
      
      return {
        ...allocation,
        recommendedBudget,
        expectedROI,
        reasoning: performanceMultiplier > 1 
          ? 'High-performing Sub ID deserves increased budget allocation'
          : 'Underperforming Sub ID should receive reduced budget'
      };
    });

    // Normalize recommended budgets to match total budget
    const totalRecommended = recommendedAllocation.reduce((sum, alloc) => sum + alloc.recommendedBudget, 0);
    const normalizationFactor = totalBudget / totalRecommended;
    
    recommendedAllocation.forEach(allocation => {
      allocation.recommendedBudget *= normalizationFactor;
    });

    const avgExpectedROI = recommendedAllocation.reduce((sum, alloc) => sum + alloc.expectedROI, 0) / recommendedAllocation.length;

    return {
      id: this.generateId(),
      currentAllocation,
      recommendedAllocation,
      expectedImprovement: {
        roi: Math.max(0, avgExpectedROI - metrics.roi),
        revenue: (avgExpectedROI - metrics.roi) * totalBudget / 100,
        orders: Math.round((avgExpectedROI - metrics.roi) * (metrics.totalOrdersSP + metrics.totalOrdersLZD) / 100)
      },
      riskAssessment: avgExpectedROI > metrics.roi * 1.2 ? 'medium' : 'low',
      justification: [
        'Reallocation based on historical Sub ID performance',
        'Optimization considers platform-specific conversion rates',
        'Budget shifts focus resources to proven performers'
      ],
      constraints: [
        {
          type: 'min_budget',
          value: totalBudget * 0.1,
          description: 'Minimum 10% budget allocation per Sub ID'
        },
        {
          type: 'total_budget',
          value: totalBudget,
          description: 'Total budget constraint maintained'
        }
      ],
      createdAt: new Date()
    };
  }

  // Helper methods

  private calculateOverallConfidence(data: AIAnalysisData): number {
    const dataPoints = data.shopeeOrders.length + data.lazadaOrders.length + data.facebookAds.length;
    const daysOfData = data.dailyMetrics.length;
    
    let confidence = 50; // Base confidence
    
    // More data points increase confidence
    if (dataPoints > 1000) confidence += 20;
    else if (dataPoints > 500) confidence += 15;
    else if (dataPoints > 100) confidence += 10;
    
    // More days of data increase confidence
    if (daysOfData > 30) confidence += 15;
    else if (daysOfData > 14) confidence += 10;
    else if (daysOfData > 7) confidence += 5;
    
    // Data consistency affects confidence
    const roiVariance = this.calculateVariance(data.dailyMetrics.map(d => d.roi));
    if (roiVariance < 10) confidence += 10;
    else if (roiVariance > 30) confidence -= 10;
    
    return Math.min(95, Math.max(60, confidence));
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private assessDataQuality(data: AIAnalysisData): { score: number; issues: string[] } {
    let score = 100;
    const issues: string[] = [];
    
    // Check data completeness
    const totalRecords = data.shopeeOrders.length + data.lazadaOrders.length + data.facebookAds.length;
    if (totalRecords < 50) {
      score -= 20;
      issues.push('Limited data volume may affect recommendation accuracy.');
    }
    
    // Check data freshness
    const daysSinceLastData = data.dailyMetrics.length > 0 
      ? Math.floor((Date.now() - new Date(data.dailyMetrics[data.dailyMetrics.length - 1].date).getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    
    if (daysSinceLastData > 7) {
      score -= 15;
      issues.push('Data may be outdated, consider importing recent data.');
    }
    
    // Check for missing Sub IDs
    const ordersWithoutSubIds = data.shopeeOrders.filter(order => 
      !order.sub_id && !order['Sub_id1'] && !order['Sub_id2']
    ).length;
    
    if (ordersWithoutSubIds > totalRecords * 0.1) {
      score -= 10;
      issues.push('Some orders are missing Sub ID information.');
    }
    
    return { score: Math.max(0, score), issues };
  }
}

// Export singleton instance
export const aiAnalysisService = new MockAIAnalysisService();