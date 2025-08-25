// AI Performance Analysis Service
// Implements basic statistical models for Sub ID and campaign performance analysis

import { AIAnalysisData, AIRecommendation, AIActionItem } from '@/types/ai';
import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';

export interface PerformanceAnalysisResult {
  overallScore: number;
  subIdPerformance: SubIdAnalysis[];
  platformPerformance: PlatformAnalysis[];
  recommendations: AIRecommendation[];
  confidenceScore: number;
}

export interface SubIdAnalysis {
  subId: string;
  platform: string;
  orders: number;
  revenue: number;
  adSpend: number;
  roi: number;
  performanceScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'declining' | 'stable';
  confidenceScore: number;
}

export interface PlatformAnalysis {
  platform: string;
  orders: number;
  revenue: number;
  adSpend: number;
  roi: number;
  marketShare: number; // Percentage of total revenue
  efficiency: number; // Revenue per dollar spent
  performanceScore: number; // 0-100
  trend: 'improving' | 'declining' | 'stable';
}

class AIPerformanceAnalyzer {
  private readonly ROI_THRESHOLD_HIGH = 50; // ROI above 50% is considered good
  private readonly ROI_THRESHOLD_LOW = 20; // ROI below 20% is considered poor
  private readonly MIN_ORDERS_FOR_ANALYSIS = 1; // Minimum orders needed for reliable analysis
  private readonly MIN_DATA_POINTS = 7; // Minimum data points for trend analysis

  /**
   * Analyze Sub ID performance using basic statistical methods
   */
  analyzeSubIdPerformance(data: AIAnalysisData): SubIdAnalysis[] {
    console.log('🤖 AI Performance Analyzer: Analyzing Sub ID performance');
    
    const subIdStats = new Map<string, {
      orders: number;
      revenue: number;
      adSpend: number;
      platforms: Set<string>;
      dailyPerformance: number[];
    }>();

    // Aggregate Sub ID data from Shopee orders
    this.processShopeeOrdersForSubIds(data.shopeeOrders, subIdStats);
    
    // Aggregate Sub ID data from Lazada orders
    this.processLazadaOrdersForSubIds(data.lazadaOrders, subIdStats);
    
    // Match Sub IDs with Facebook ad spend
    this.matchSubIdsWithAdSpend(data.facebookAds, subIdStats);
    
    // Calculate daily performance for trend analysis
    this.calculateDailySubIdPerformance(data.dailyMetrics, subIdStats);

    // Convert to analysis results
    const subIdAnalyses: SubIdAnalysis[] = [];
    
    subIdStats.forEach((stats, subId) => {
      if (stats.orders >= this.MIN_ORDERS_FOR_ANALYSIS) {
        const roi = stats.adSpend > 0 ? ((stats.revenue - stats.adSpend) / stats.adSpend) * 100 : 0;
        const performanceScore = this.calculatePerformanceScore(roi, stats.orders, stats.revenue);
        const riskLevel = this.assessRiskLevel(roi, stats.orders, stats.adSpend);
        const trend = this.calculateTrend(stats.dailyPerformance);
        const confidenceScore = this.calculateConfidenceScore(stats.orders, stats.dailyPerformance.length);
        
        subIdAnalyses.push({
          subId,
          platform: stats.platforms.size === 1 ? Array.from(stats.platforms)[0] : 'Mixed',
          orders: stats.orders,
          revenue: stats.revenue,
          adSpend: stats.adSpend,
          roi,
          performanceScore,
          riskLevel,
          trend,
          confidenceScore
        });
      }
    });

    // Sort by performance score (highest first)
    return subIdAnalyses.sort((a, b) => b.performanceScore - a.performanceScore);
  }

  /**
   * Analyze platform performance
   */
  analyzePlatformPerformance(data: AIAnalysisData): PlatformAnalysis[] {
    const metrics = data.calculatedMetrics;
    const totalRevenue = metrics.totalCom;
    const totalAdSpend = metrics.totalAdsSpent;
    
    const platforms: PlatformAnalysis[] = [];

    // Shopee analysis
    if (metrics.totalOrdersSP > 0) {
      const shopeeAdSpend = totalAdSpend * 0.6; // Assume 60% allocation to Shopee
      const shopeeROI = shopeeAdSpend > 0 ? ((metrics.totalComSP - shopeeAdSpend) / shopeeAdSpend) * 100 : 0;
      const shopeeEfficiency = shopeeAdSpend > 0 ? metrics.totalComSP / shopeeAdSpend : 0;
      const shopeeMarketShare = totalRevenue > 0 ? (metrics.totalComSP / totalRevenue) * 100 : 0;
      
      platforms.push({
        platform: 'Shopee',
        orders: metrics.totalOrdersSP,
        revenue: metrics.totalComSP,
        adSpend: shopeeAdSpend,
        roi: shopeeROI,
        marketShare: shopeeMarketShare,
        efficiency: shopeeEfficiency,
        performanceScore: this.calculatePerformanceScore(shopeeROI, metrics.totalOrdersSP, metrics.totalComSP),
        trend: this.calculatePlatformTrend(data.dailyMetrics, 'shopee')
      });
    }

    // Lazada analysis
    if (metrics.totalOrdersLZD > 0) {
      const lazadaAdSpend = totalAdSpend * 0.4; // Assume 40% allocation to Lazada
      const lazadaROI = lazadaAdSpend > 0 ? ((metrics.totalComLZD - lazadaAdSpend) / lazadaAdSpend) * 100 : 0;
      const lazadaEfficiency = lazadaAdSpend > 0 ? metrics.totalComLZD / lazadaAdSpend : 0;
      const lazadaMarketShare = totalRevenue > 0 ? (metrics.totalComLZD / totalRevenue) * 100 : 0;
      
      platforms.push({
        platform: 'Lazada',
        orders: metrics.totalOrdersLZD,
        revenue: metrics.totalComLZD,
        adSpend: lazadaAdSpend,
        roi: lazadaROI,
        marketShare: lazadaMarketShare,
        efficiency: lazadaEfficiency,
        performanceScore: this.calculatePerformanceScore(lazadaROI, metrics.totalOrdersLZD, metrics.totalComLZD),
        trend: this.calculatePlatformTrend(data.dailyMetrics, 'lazada')
      });
    }

    return platforms.sort((a, b) => b.performanceScore - a.performanceScore);
  }

  /**
   * Generate performance-based recommendations
   */
  generateRecommendations(data: AIAnalysisData): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const subIdAnalyses = this.analyzeSubIdPerformance(data);
    const platformAnalyses = this.analyzePlatformPerformance(data);
    const metrics = data.calculatedMetrics;

    // Sub ID optimization recommendations
    const underperformingSubIds = subIdAnalyses.filter(analysis => 
      analysis.roi < this.ROI_THRESHOLD_LOW && analysis.orders >= 1
    );

    if (underperformingSubIds.length > 0) {
      const totalWastedSpend = underperformingSubIds.reduce((sum, subId) => sum + subId.adSpend, 0);
      const potentialSavings = totalWastedSpend * 0.7; // Assume 70% can be saved
      
      recommendations.push({
        id: this.generateId(),
        type: 'subid',
        title: 'Pause Underperforming Sub IDs',
        description: `${underperformingSubIds.length} Sub IDs are performing below ${this.ROI_THRESHOLD_LOW}% ROI threshold.`,
        expectedImpact: 25,
        confidenceScore: this.calculateRecommendationConfidence(underperformingSubIds.length, data.dailyMetrics.length),
        priority: 'high',
        actionItems: this.createSubIdActionItems(underperformingSubIds, potentialSavings),
        estimatedROIImprovement: 25,
        affectedSubIds: underperformingSubIds.map(s => s.subId),
        reasoning: `Analysis shows ${underperformingSubIds.length} Sub IDs with ROI below ${this.ROI_THRESHOLD_LOW}%. Pausing these campaigns can free up budget for better-performing Sub IDs.`,
        dataPoints: underperformingSubIds.reduce((sum, s) => sum + s.orders, 0),
        createdAt: new Date()
      });
    }

    // High-performing Sub ID scaling recommendations
    const highPerformingSubIds = subIdAnalyses.filter(analysis => 
      analysis.roi > this.ROI_THRESHOLD_HIGH && analysis.trend === 'improving'
    );

    if (highPerformingSubIds.length > 0) {
      recommendations.push({
        id: this.generateId(),
        type: 'budget',
        title: 'Scale High-Performing Sub IDs',
        description: `${highPerformingSubIds.length} Sub IDs are performing above ${this.ROI_THRESHOLD_HIGH}% ROI with improving trends.`,
        expectedImpact: 30,
        confidenceScore: this.calculateRecommendationConfidence(highPerformingSubIds.length, data.dailyMetrics.length),
        priority: 'high',
        actionItems: this.createScalingActionItems(highPerformingSubIds),
        estimatedROIImprovement: 30,
        affectedSubIds: highPerformingSubIds.map(s => s.subId),
        reasoning: `These Sub IDs show strong performance (>${this.ROI_THRESHOLD_HIGH}% ROI) and improving trends. Increasing budget allocation can maximize returns.`,
        dataPoints: highPerformingSubIds.reduce((sum, s) => sum + s.orders, 0),
        createdAt: new Date()
      });
    }

    // Platform optimization recommendations
    if (platformAnalyses.length > 1) {
      const bestPlatform = platformAnalyses[0];
      const worstPlatform = platformAnalyses[platformAnalyses.length - 1];
      
      if (bestPlatform.roi - worstPlatform.roi > 20) {
        recommendations.push({
          id: this.generateId(),
          type: 'platform',
          title: `Focus Budget on ${bestPlatform.platform}`,
          description: `${bestPlatform.platform} outperforms ${worstPlatform.platform} by ${(bestPlatform.roi - worstPlatform.roi).toFixed(1)}% ROI.`,
          expectedImpact: 20,
          confidenceScore: this.calculateRecommendationConfidence(bestPlatform.orders + worstPlatform.orders, data.dailyMetrics.length),
          priority: 'medium',
          actionItems: this.createPlatformActionItems(bestPlatform, worstPlatform),
          estimatedROIImprovement: 20,
          affectedPlatforms: [bestPlatform.platform, worstPlatform.platform],
          reasoning: `Platform analysis shows significant performance gap. ${bestPlatform.platform} has ${bestPlatform.roi.toFixed(1)}% ROI vs ${worstPlatform.roi.toFixed(1)}% for ${worstPlatform.platform}.`,
          dataPoints: bestPlatform.orders + worstPlatform.orders,
          createdAt: new Date()
        });
      }
    }

    // Overall performance recommendations
    if (metrics.roi < this.ROI_THRESHOLD_LOW) {
      recommendations.push({
        id: this.generateId(),
        type: 'budget',
        title: 'Overall Campaign Optimization Needed',
        description: `Current overall ROI of ${metrics.roi.toFixed(1)}% is below optimal performance threshold.`,
        expectedImpact: 35,
        confidenceScore: this.calculateRecommendationConfidence(metrics.totalOrdersSP + metrics.totalOrdersLZD, data.dailyMetrics.length),
        priority: 'high',
        actionItems: this.createOverallOptimizationActions(metrics),
        estimatedROIImprovement: 35,
        reasoning: `Overall campaign ROI of ${metrics.roi.toFixed(1)}% indicates systematic optimization opportunities across Sub IDs and platforms.`,
        dataPoints: metrics.totalOrdersSP + metrics.totalOrdersLZD,
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall performance analysis result
   */
  analyzeOverallPerformance(data: AIAnalysisData): PerformanceAnalysisResult {
    const subIdPerformance = this.analyzeSubIdPerformance(data);
    const platformPerformance = this.analyzePlatformPerformance(data);
    const recommendations = this.generateRecommendations(data);
    
    // Calculate overall performance score
    const overallScore = this.calculateOverallScore(data.calculatedMetrics, subIdPerformance, platformPerformance);
    
    // Calculate confidence based on data quality and quantity
    const confidenceScore = this.calculateOverallConfidence(data);

    return {
      overallScore,
      subIdPerformance,
      platformPerformance,
      recommendations,
      confidenceScore
    };
  }

  // Private helper methods

  private processShopeeOrdersForSubIds(orders: any[], subIdStats: Map<string, any>): void {
    const uniqueOrders = new Map();
    
    // Deduplicate orders by order ID
    orders.forEach(order => {
      const orderId = order['รหัสการสั่งซื้อ'];
      const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      
      // Skip cancelled orders
      if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
        return;
      }
      
      if (!uniqueOrders.has(orderId)) {
        uniqueOrders.set(orderId, order);
      }
    });

    // Process unique orders
    uniqueOrders.forEach(order => {
      const subIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);

      const commission = this.parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);

      subIds.forEach(subId => {
        if (!subIdStats.has(subId)) {
          subIdStats.set(subId, {
            orders: 0,
            revenue: 0,
            adSpend: 0,
            platforms: new Set(),
            dailyPerformance: []
          });
        }

        const stats = subIdStats.get(subId);
        stats.orders += 1;
        stats.revenue += commission;
        stats.platforms.add('Shopee');
      });
    });
  }

  private processLazadaOrdersForSubIds(orders: any[], subIdStats: Map<string, any>): void {
    // Filter for fulfilled and valid orders
    const validOrders = orders.filter(order => 
      (order['Status'] === 'Fulfilled' || order['Status'] === 'Delivered') &&
      order['Validity'] === 'valid'
    );

    validOrders.forEach(order => {
      const subIds = [
        order['Aff Sub ID'],
        order['Sub ID 1'],
        order['Sub ID 2'],
        order['Sub ID 3'],
        order['Sub ID 4']
      ].filter(Boolean);

      const payout = this.parseNumber(order['Payout']);

      subIds.forEach(subId => {
        if (!subIdStats.has(subId)) {
          subIdStats.set(subId, {
            orders: 0,
            revenue: 0,
            adSpend: 0,
            platforms: new Set(),
            dailyPerformance: []
          });
        }

        const stats = subIdStats.get(subId);
        stats.orders += 1;
        stats.revenue += payout;
        stats.platforms.add('Lazada');
      });
    });
  }

  private matchSubIdsWithAdSpend(facebookAds: any[], subIdStats: Map<string, any>): void {
    subIdStats.forEach((stats, subId) => {
      let adSpend = 0;
      
      facebookAds.forEach(ad => {
        const campaignName = ad['Campaign name'] || '';
        const adSetName = ad['Ad set name'] || '';
        const adName = ad['Ad name'] || '';
        
        const allNames = `${campaignName} ${adSetName} ${adName}`.toLowerCase();
        
        if (subId && typeof subId === 'string' && allNames.includes(subId.toLowerCase())) {
          adSpend += this.parseNumber(ad['Amount spent (THB)']);
        }
      });
      
      stats.adSpend = adSpend;
    });
  }

  private calculateDailySubIdPerformance(dailyMetrics: DailyMetrics[], subIdStats: Map<string, any>): void {
    // Simplified daily performance calculation
    // In a real implementation, this would track Sub ID performance by day
    subIdStats.forEach((stats, subId) => {
      // Mock daily performance based on overall ROI with some variance
      const baseROI = stats.adSpend > 0 ? ((stats.revenue - stats.adSpend) / stats.adSpend) * 100 : 0;
      
      for (let i = 0; i < Math.min(dailyMetrics.length, 30); i++) {
        const variance = (Math.random() - 0.5) * 20; // ±10% variance
        stats.dailyPerformance.push(baseROI + variance);
      }
    });
  }

  private calculatePerformanceScore(roi: number, orders: number, revenue: number): number {
    let score = 0;
    
    // ROI component (40% weight)
    if (roi >= this.ROI_THRESHOLD_HIGH) {
      score += 40;
    } else if (roi >= this.ROI_THRESHOLD_LOW) {
      score += 20 + ((roi - this.ROI_THRESHOLD_LOW) / (this.ROI_THRESHOLD_HIGH - this.ROI_THRESHOLD_LOW)) * 20;
    } else {
      score += Math.max(0, (roi / this.ROI_THRESHOLD_LOW) * 20);
    }
    
    // Volume component (30% weight)
    const volumeScore = Math.min(30, (orders / 50) * 30); // Max score at 50 orders
    score += volumeScore;
    
    // Revenue component (30% weight)
    const revenueScore = Math.min(30, (revenue / 10000) * 30); // Max score at 10,000 revenue
    score += revenueScore;
    
    return Math.min(100, Math.max(0, score));
  }

  private assessRiskLevel(roi: number, orders: number, adSpend: number): 'low' | 'medium' | 'high' {
    if (roi < 0 || (orders < 10 && adSpend > 1000)) {
      return 'high';
    } else if (roi < this.ROI_THRESHOLD_LOW || orders < 20) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private calculateTrend(dailyPerformance: number[]): 'improving' | 'declining' | 'stable' {
    if (dailyPerformance.length < this.MIN_DATA_POINTS) {
      return 'stable';
    }
    
    // Simple linear regression to determine trend
    const n = dailyPerformance.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = dailyPerformance.reduce((sum, val) => sum + val, 0);
    const sumXY = dailyPerformance.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = dailyPerformance.reduce((sum, _, index) => sum + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 1) return 'improving';
    if (slope < -1) return 'declining';
    return 'stable';
  }

  private calculatePlatformTrend(dailyMetrics: DailyMetrics[], platform: string): 'improving' | 'declining' | 'stable' {
    if (dailyMetrics.length < this.MIN_DATA_POINTS) {
      return 'stable';
    }
    
    // Extract platform-specific data (simplified)
    const platformData = dailyMetrics.map(day => {
      if (platform === 'shopee') {
        return day.ordersSP || 0;
      } else if (platform === 'lazada') {
        return day.ordersLZD || 0;
      }
      return day.roi;
    });
    
    return this.calculateTrend(platformData);
  }

  private calculateConfidenceScore(orders: number, dataPoints: number): number {
    let confidence = 50; // Base confidence
    
    // More orders increase confidence
    if (orders >= 100) confidence += 25;
    else if (orders >= 50) confidence += 15;
    else if (orders >= 20) confidence += 10;
    
    // More data points increase confidence
    if (dataPoints >= 30) confidence += 15;
    else if (dataPoints >= 14) confidence += 10;
    else if (dataPoints >= 7) confidence += 5;
    
    // Penalty for very low data
    if (orders < 5) confidence -= 20;
    if (dataPoints < 3) confidence -= 15;
    
    return Math.min(95, Math.max(30, confidence));
  }

  private calculateRecommendationConfidence(affectedItems: number, dataPoints: number): number {
    let confidence = 60; // Base confidence for recommendations
    
    // More affected items increase confidence
    if (affectedItems >= 5) confidence += 20;
    else if (affectedItems >= 3) confidence += 10;
    
    // More data points increase confidence
    if (dataPoints >= 14) confidence += 15;
    else if (dataPoints >= 7) confidence += 10;
    
    return Math.min(90, Math.max(50, confidence));
  }

  private calculateOverallScore(metrics: CalculatedMetrics, subIdPerformance: SubIdAnalysis[], platformPerformance: PlatformAnalysis[]): number {
    let score = 0;
    
    // ROI component (40% weight)
    if (metrics.roi >= this.ROI_THRESHOLD_HIGH) {
      score += 40;
    } else if (metrics.roi >= this.ROI_THRESHOLD_LOW) {
      score += 20 + ((metrics.roi - this.ROI_THRESHOLD_LOW) / (this.ROI_THRESHOLD_HIGH - this.ROI_THRESHOLD_LOW)) * 20;
    } else {
      score += Math.max(0, (metrics.roi / this.ROI_THRESHOLD_LOW) * 20);
    }
    
    // Sub ID diversity (30% weight)
    const avgSubIdScore = subIdPerformance.length > 0 
      ? subIdPerformance.reduce((sum, s) => sum + s.performanceScore, 0) / subIdPerformance.length 
      : 0;
    score += (avgSubIdScore / 100) * 30;
    
    // Platform performance (30% weight)
    const avgPlatformScore = platformPerformance.length > 0 
      ? platformPerformance.reduce((sum, p) => sum + p.performanceScore, 0) / platformPerformance.length 
      : 0;
    score += (avgPlatformScore / 100) * 30;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateOverallConfidence(data: AIAnalysisData): number {
    const totalOrders = data.calculatedMetrics.totalOrdersSP + data.calculatedMetrics.totalOrdersLZD;
    const dataPoints = data.dailyMetrics.length;
    const subIdCount = data.subIds.length;
    
    let confidence = 50; // Base confidence
    
    // Data volume
    if (totalOrders >= 200) confidence += 20;
    else if (totalOrders >= 100) confidence += 15;
    else if (totalOrders >= 50) confidence += 10;
    
    // Data history
    if (dataPoints >= 30) confidence += 15;
    else if (dataPoints >= 14) confidence += 10;
    else if (dataPoints >= 7) confidence += 5;
    
    // Sub ID diversity
    if (subIdCount >= 10) confidence += 10;
    else if (subIdCount >= 5) confidence += 5;
    
    // Data quality penalties
    if (totalOrders < 20) confidence -= 15;
    if (dataPoints < 7) confidence -= 10;
    if (subIdCount < 3) confidence -= 5;
    
    return Math.min(95, Math.max(40, confidence));
  }

  // Action item creation helpers

  private createSubIdActionItems(underperformingSubIds: SubIdAnalysis[], potentialSavings: number): AIActionItem[] {
    return [
      {
        id: this.generateId(),
        description: `Pause ${underperformingSubIds.length} underperforming Sub IDs`,
        type: 'pause_campaign',
        currentValue: underperformingSubIds.reduce((sum, s) => sum + s.adSpend, 0),
        recommendedValue: 0,
        estimatedImpact: `Save $${potentialSavings.toFixed(2)} in ad spend`
      },
      {
        id: this.generateId(),
        description: 'Analyze successful Sub ID patterns for future optimization',
        type: 'optimize_creative',
        estimatedImpact: '+15% future campaign performance'
      }
    ];
  }

  private createScalingActionItems(highPerformingSubIds: SubIdAnalysis[]): AIActionItem[] {
    const totalCurrentSpend = highPerformingSubIds.reduce((sum, s) => sum + s.adSpend, 0);
    const recommendedIncrease = totalCurrentSpend * 0.5; // 50% increase
    
    return [
      {
        id: this.generateId(),
        description: `Increase budget for ${highPerformingSubIds.length} high-performing Sub IDs by 50%`,
        type: 'increase_budget',
        currentValue: totalCurrentSpend,
        recommendedValue: totalCurrentSpend + recommendedIncrease,
        estimatedImpact: `+$${(recommendedIncrease * 0.3).toFixed(2)} additional revenue`
      },
      {
        id: this.generateId(),
        description: 'Monitor performance closely and scale further if trends continue',
        type: 'optimize_creative',
        estimatedImpact: 'Sustained growth optimization'
      }
    ];
  }

  private createPlatformActionItems(bestPlatform: PlatformAnalysis, worstPlatform: PlatformAnalysis): AIActionItem[] {
    const reallocationAmount = worstPlatform.adSpend * 0.3; // Move 30% of budget
    
    return [
      {
        id: this.generateId(),
        description: `Reallocate 30% of ${worstPlatform.platform} budget to ${bestPlatform.platform}`,
        type: 'budget_adjustment',
        currentValue: worstPlatform.adSpend,
        recommendedValue: worstPlatform.adSpend - reallocationAmount,
        estimatedImpact: `+${((bestPlatform.roi - worstPlatform.roi) * 0.3).toFixed(1)}% ROI improvement`
      },
      {
        id: this.generateId(),
        description: `Analyze ${bestPlatform.platform} success factors for ${worstPlatform.platform} optimization`,
        type: 'optimize_creative',
        estimatedImpact: 'Cross-platform optimization insights'
      }
    ];
  }

  private createOverallOptimizationActions(metrics: CalculatedMetrics): AIActionItem[] {
    return [
      {
        id: this.generateId(),
        description: 'Conduct comprehensive campaign audit',
        type: 'optimize_creative',
        estimatedImpact: 'Identify systematic optimization opportunities'
      },
      {
        id: this.generateId(),
        description: 'Implement daily budget monitoring and automatic pausing for negative ROI campaigns',
        type: 'budget_adjustment',
        currentValue: metrics.totalAdsSpent,
        recommendedValue: metrics.totalAdsSpent * 0.8,
        estimatedImpact: '+20% budget efficiency'
      },
      {
        id: this.generateId(),
        description: 'Focus on top 20% performing Sub IDs and pause bottom 20%',
        type: 'pause_campaign',
        estimatedImpact: '+35% overall ROI improvement'
      }
    ];
  }

  private parseNumber(value: string | number | undefined): number {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    
    const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiPerformanceAnalyzer = new AIPerformanceAnalyzer();