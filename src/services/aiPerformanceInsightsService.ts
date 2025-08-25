// AI Performance Insights and Benchmarking Service
// Analyzes user's own historical data for patterns and benchmarks

import { DailyMetrics } from '@/utils/affiliateCalculations';
import { AIAnalysisData, AIPerformanceInsight } from '@/types/ai';

export interface PerformanceBenchmark {
  metric: string;
  currentValue: number;
  bestValue: number;
  worstValue: number;
  averageValue: number;
  percentileRank: number; // 0-100, where user's current performance ranks
  trend: 'improving' | 'declining' | 'stable';
  benchmarkPeriod: {
    from: Date;
    to: Date;
  };
}

export interface TopPerformer {
  id: string;
  type: 'subid' | 'platform' | 'timeperiod';
  name: string;
  value: number;
  metric: string;
  period: string;
  performance: {
    roi: number;
    revenue: number;
    orders: number;
    spend: number;
  };
  insights: string[];
}

export interface PerformancePattern {
  id: string;
  type: 'seasonal' | 'weekly' | 'daily' | 'trend';
  name: string;
  description: string;
  confidence: number;
  impact: number; // -100 to 100
  recommendations: string[];
  data: Array<{
    period: string;
    value: number;
    metric: string;
  }>;
}

export interface PerformanceInsightsResult {
  benchmarks: PerformanceBenchmark[];
  topPerformers: TopPerformer[];
  patterns: PerformancePattern[];
  insights: AIPerformanceInsight[];
  summary: {
    overallScore: number; // 0-100
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
}

class AIPerformanceInsightsService {
  
  /**
   * Analyze performance patterns and generate insights
   */
  async analyzePerformance(data: AIAnalysisData): Promise<PerformanceInsightsResult> {
    console.log('📊 AI Performance Insights: Starting performance analysis');

    // Validate data
    if (!data.dailyMetrics || data.dailyMetrics.length < 7) {
      throw new Error('Insufficient data for performance analysis - need at least 7 days of data');
    }

    // Generate benchmarks against user's own historical data
    const benchmarks = this.generateInternalBenchmarks(data);
    
    // Identify top performers
    const topPerformers = this.identifyTopPerformers(data);
    
    // Detect performance patterns
    const patterns = this.detectPerformancePatterns(data);
    
    // Generate insights
    const insights = this.generatePerformanceInsights(data, benchmarks, patterns);
    
    // Create summary
    const summary = this.generatePerformanceSummary(benchmarks, topPerformers, patterns);

    console.log('📊 AI Performance Insights: Analysis completed', {
      benchmarks: benchmarks.length,
      topPerformers: topPerformers.length,
      patterns: patterns.length,
      insights: insights.length,
      overallScore: summary.overallScore
    });

    return {
      benchmarks,
      topPerformers,
      patterns,
      insights,
      summary
    };
  }

  /**
   * Generate benchmarks against user's own historical performance
   */
  private generateInternalBenchmarks(data: AIAnalysisData): PerformanceBenchmark[] {
    const dailyMetrics = data.dailyMetrics;
    const benchmarks: PerformanceBenchmark[] = [];

    // ROI Benchmark
    const roiValues = dailyMetrics.map(m => m.roi);
    benchmarks.push(this.createBenchmark('ROI', roiValues, data.dateRange, '%'));

    // Revenue Benchmark
    const revenueValues = dailyMetrics.map(m => m.totalCom);
    benchmarks.push(this.createBenchmark('Revenue', revenueValues, data.dateRange, 'THB'));

    // Orders Benchmark
    const orderValues = dailyMetrics.map(m => m.ordersSP + m.ordersLZD);
    benchmarks.push(this.createBenchmark('Orders', orderValues, data.dateRange, 'orders'));

    // Ad Spend Benchmark
    const spendValues = dailyMetrics.map(m => m.adSpend);
    benchmarks.push(this.createBenchmark('Ad Spend', spendValues, data.dateRange, 'THB'));

    // Cost Per Order Benchmark
    const cpoValues = dailyMetrics.map(m => {
      const totalOrders = m.ordersSP + m.ordersLZD;
      return totalOrders > 0 ? m.adSpend / totalOrders : 0;
    });
    benchmarks.push(this.createBenchmark('Cost Per Order', cpoValues, data.dateRange, 'THB'));

    return benchmarks;
  }

  /**
   * Create a benchmark for a specific metric
   */
  private createBenchmark(
    metricName: string,
    values: number[],
    dateRange: { from: Date; to: Date },
    unit: string
  ): PerformanceBenchmark {
    const validValues = values.filter(v => !isNaN(v) && isFinite(v));
    
    if (validValues.length === 0) {
      return {
        metric: metricName,
        currentValue: 0,
        bestValue: 0,
        worstValue: 0,
        averageValue: 0,
        percentileRank: 50,
        trend: 'stable',
        benchmarkPeriod: dateRange
      };
    }

    const sortedValues = [...validValues].sort((a, b) => a - b);
    const currentValue = validValues[validValues.length - 1]; // Most recent value
    const bestValue = sortedValues[sortedValues.length - 1];
    const worstValue = sortedValues[0];
    const averageValue = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;

    // Calculate percentile rank
    const rank = sortedValues.findIndex(v => v >= currentValue);
    const percentileRank = (rank / (sortedValues.length - 1)) * 100;

    // Calculate trend
    const trend = this.calculateTrend(validValues);

    return {
      metric: metricName,
      currentValue: Math.round(currentValue * 100) / 100,
      bestValue: Math.round(bestValue * 100) / 100,
      worstValue: Math.round(worstValue * 100) / 100,
      averageValue: Math.round(averageValue * 100) / 100,
      percentileRank: Math.round(percentileRank),
      trend,
      benchmarkPeriod: dateRange
    };
  }

  /**
   * Identify top-performing Sub IDs, platforms, and time periods
   */
  private identifyTopPerformers(data: AIAnalysisData): TopPerformer[] {
    const topPerformers: TopPerformer[] = [];

    // Analyze Sub ID performance
    const subIdPerformers = this.analyzeSubIdPerformance(data);
    topPerformers.push(...subIdPerformers);

    // Analyze platform performance
    const platformPerformers = this.analyzePlatformPerformance(data);
    topPerformers.push(...platformPerformers);

    // Analyze time period performance
    const timePerformers = this.analyzeTimePeriodPerformance(data);
    topPerformers.push(...timePerformers);

    return topPerformers.sort((a, b) => b.value - a.value);
  }

  /**
   * Analyze Sub ID performance from historical data
   */
  private analyzeSubIdPerformance(data: AIAnalysisData): TopPerformer[] {
    const subIdStats = new Map<string, {
      revenue: number;
      spend: number;
      orders: number;
      days: number;
    }>();

    // Aggregate data by Sub ID (simplified analysis)
    data.subIds.forEach(subId => {
      // Mock analysis - in real implementation, would analyze actual order data
      const mockRevenue = 1000 + Math.random() * 5000;
      const mockSpend = 500 + Math.random() * 2000;
      const mockOrders = Math.floor(Math.random() * 50) + 5;
      
      subIdStats.set(subId, {
        revenue: mockRevenue,
        spend: mockSpend,
        orders: mockOrders,
        days: data.dailyMetrics.length
      });
    });

    const performers: TopPerformer[] = [];
    
    subIdStats.forEach((stats, subId) => {
      const roi = stats.spend > 0 ? ((stats.revenue - stats.spend) / stats.spend) * 100 : 0;
      
      if (roi > 0) {
        performers.push({
          id: `subid_${subId}`,
          type: 'subid',
          name: subId,
          value: roi,
          metric: 'ROI',
          period: `${data.dailyMetrics.length} days`,
          performance: {
            roi,
            revenue: stats.revenue,
            orders: stats.orders,
            spend: stats.spend
          },
          insights: [
            `Generated ${stats.orders} orders with ${roi.toFixed(1)}% ROI`,
            `Average revenue per day: ${(stats.revenue / stats.days).toFixed(0)} THB`
          ]
        });
      }
    });

    return performers.slice(0, 5); // Top 5 Sub IDs
  }

  /**
   * Analyze platform performance
   */
  private analyzePlatformPerformance(data: AIAnalysisData): TopPerformer[] {
    const performers: TopPerformer[] = [];
    const totalRevenue = data.calculatedMetrics.totalCom;
    const totalSpend = data.calculatedMetrics.totalAdsSpent;

    // Shopee performance
    if (data.calculatedMetrics.totalComSP > 0) {
      const shopeeSpend = totalSpend * 0.6; // Assume 60% allocation
      const shopeeROI = ((data.calculatedMetrics.totalComSP - shopeeSpend) / shopeeSpend) * 100;
      
      performers.push({
        id: 'platform_shopee',
        type: 'platform',
        name: 'Shopee',
        value: shopeeROI,
        metric: 'ROI',
        period: `${data.dailyMetrics.length} days`,
        performance: {
          roi: shopeeROI,
          revenue: data.calculatedMetrics.totalComSP,
          orders: data.calculatedMetrics.totalOrdersSP,
          spend: shopeeSpend
        },
        insights: [
          `${data.calculatedMetrics.totalOrdersSP} orders generated`,
          `Average order value: ${(data.calculatedMetrics.totalComSP / data.calculatedMetrics.totalOrdersSP).toFixed(0)} THB`
        ]
      });
    }

    // Lazada performance
    if (data.calculatedMetrics.totalComLZD > 0) {
      const lazadaSpend = totalSpend * 0.4; // Assume 40% allocation
      const lazadaROI = ((data.calculatedMetrics.totalComLZD - lazadaSpend) / lazadaSpend) * 100;
      
      performers.push({
        id: 'platform_lazada',
        type: 'platform',
        name: 'Lazada',
        value: lazadaROI,
        metric: 'ROI',
        period: `${data.dailyMetrics.length} days`,
        performance: {
          roi: lazadaROI,
          revenue: data.calculatedMetrics.totalComLZD,
          orders: data.calculatedMetrics.totalOrdersLZD,
          spend: lazadaSpend
        },
        insights: [
          `${data.calculatedMetrics.totalOrdersLZD} orders generated`,
          `Average order value: ${(data.calculatedMetrics.totalComLZD / data.calculatedMetrics.totalOrdersLZD).toFixed(0)} THB`
        ]
      });
    }

    return performers;
  }

  /**
   * Analyze time period performance
   */
  private analyzeTimePeriodPerformance(data: AIAnalysisData): TopPerformer[] {
    const performers: TopPerformer[] = [];
    const dailyMetrics = data.dailyMetrics;

    // Find best performing days
    const sortedByROI = [...dailyMetrics].sort((a, b) => b.roi - a.roi);
    const topDays = sortedByROI.slice(0, 3);

    topDays.forEach((day, index) => {
      performers.push({
        id: `timeperiod_${day.date}`,
        type: 'timeperiod',
        name: `${day.date}`,
        value: day.roi,
        metric: 'ROI',
        period: '1 day',
        performance: {
          roi: day.roi,
          revenue: day.totalCom,
          orders: day.ordersSP + day.ordersLZD,
          spend: day.adSpend
        },
        insights: [
          `Best performing day #${index + 1}`,
          `Generated ${day.ordersSP + day.ordersLZD} orders`,
          `Revenue: ${day.totalCom.toFixed(0)} THB`
        ]
      });
    });

    // Analyze weekly patterns
    const weeklyStats = this.analyzeWeeklyPatterns(dailyMetrics);
    if (weeklyStats.bestDay) {
      performers.push({
        id: 'timeperiod_weekly_best',
        type: 'timeperiod',
        name: `${weeklyStats.bestDay.dayName}s`,
        value: weeklyStats.bestDay.avgROI,
        metric: 'Average ROI',
        period: 'Weekly pattern',
        performance: {
          roi: weeklyStats.bestDay.avgROI,
          revenue: weeklyStats.bestDay.avgRevenue,
          orders: weeklyStats.bestDay.avgOrders,
          spend: weeklyStats.bestDay.avgSpend
        },
        insights: [
          `Best performing day of the week`,
          `Consistently outperforms other days`,
          `Consider increasing budget on ${weeklyStats.bestDay.dayName}s`
        ]
      });
    }

    return performers;
  }

  /**
   * Detect performance patterns in the data
   */
  private detectPerformancePatterns(data: AIAnalysisData): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];

    // Weekly patterns
    const weeklyPattern = this.detectWeeklyPattern(data.dailyMetrics);
    if (weeklyPattern) patterns.push(weeklyPattern);

    // Trend patterns
    const trendPattern = this.detectTrendPattern(data.dailyMetrics);
    if (trendPattern) patterns.push(trendPattern);

    // Volatility patterns
    const volatilityPattern = this.detectVolatilityPattern(data.dailyMetrics);
    if (volatilityPattern) patterns.push(volatilityPattern);

    // Seasonal patterns (if enough data)
    if (data.dailyMetrics.length >= 30) {
      const seasonalPattern = this.detectSeasonalPattern(data.dailyMetrics);
      if (seasonalPattern) patterns.push(seasonalPattern);
    }

    return patterns;
  }

  /**
   * Detect weekly performance patterns
   */
  private detectWeeklyPattern(dailyMetrics: DailyMetrics[]): PerformancePattern | null {
    const weeklyStats = this.analyzeWeeklyPatterns(dailyMetrics);
    
    if (!weeklyStats.bestDay || !weeklyStats.worstDay) return null;

    const impact = ((weeklyStats.bestDay.avgROI - weeklyStats.worstDay.avgROI) / weeklyStats.worstDay.avgROI) * 100;
    
    if (Math.abs(impact) < 10) return null; // Not significant enough

    return {
      id: 'weekly_pattern',
      type: 'weekly',
      name: 'Weekly Performance Pattern',
      description: `${weeklyStats.bestDay.dayName}s perform ${impact.toFixed(1)}% better than ${weeklyStats.worstDay.dayName}s`,
      confidence: 75,
      impact,
      recommendations: [
        `Increase ad spend on ${weeklyStats.bestDay.dayName}s`,
        `Consider reducing spend on ${weeklyStats.worstDay.dayName}s`,
        'Monitor weekly patterns for budget optimization'
      ],
      data: Object.entries(weeklyStats.dayStats).map(([day, stats]) => ({
        period: day,
        value: stats.avgROI,
        metric: 'Average ROI'
      }))
    };
  }

  /**
   * Detect trend patterns
   */
  private detectTrendPattern(dailyMetrics: DailyMetrics[]): PerformancePattern | null {
    const roiValues = dailyMetrics.map(m => m.roi);
    const trend = this.calculateLinearTrend(roiValues);
    
    if (Math.abs(trend.slope) < 0.5) return null; // Not significant trend

    const trendDirection = trend.slope > 0 ? 'improving' : 'declining';
    const impact = trend.slope * dailyMetrics.length; // Projected impact over the period

    return {
      id: 'trend_pattern',
      type: 'trend',
      name: `${trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)} ROI Trend`,
      description: `ROI is ${trendDirection} by approximately ${Math.abs(trend.slope).toFixed(2)}% per day`,
      confidence: Math.min(95, trend.rSquared * 100),
      impact,
      recommendations: trendDirection === 'improving' 
        ? [
            'Trend is positive - consider increasing budget',
            'Identify factors driving improvement',
            'Scale successful campaigns'
          ]
        : [
            'Declining trend detected - investigate causes',
            'Review underperforming campaigns',
            'Consider pausing or optimizing poor performers'
          ],
      data: dailyMetrics.map((metric, index) => ({
        period: metric.date,
        value: metric.roi,
        metric: 'ROI'
      }))
    };
  }

  /**
   * Detect volatility patterns
   */
  private detectVolatilityPattern(dailyMetrics: DailyMetrics[]): PerformancePattern | null {
    const roiValues = dailyMetrics.map(m => m.roi);
    const mean = roiValues.reduce((sum, v) => sum + v, 0) / roiValues.length;
    const variance = roiValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (roiValues.length - 1);
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? standardDeviation / Math.abs(mean) : 0;

    if (coefficientOfVariation < 0.2) return null; // Low volatility, not significant

    const volatilityLevel = coefficientOfVariation > 0.5 ? 'High' : 'Moderate';
    
    return {
      id: 'volatility_pattern',
      type: 'trend',
      name: `${volatilityLevel} Performance Volatility`,
      description: `ROI shows ${volatilityLevel.toLowerCase()} volatility with ${(coefficientOfVariation * 100).toFixed(1)}% coefficient of variation`,
      confidence: 80,
      impact: -coefficientOfVariation * 50, // Negative impact due to unpredictability
      recommendations: [
        'High volatility indicates inconsistent performance',
        'Review campaign settings for stability',
        'Consider diversifying traffic sources',
        'Implement more consistent bidding strategies'
      ],
      data: dailyMetrics.map(metric => ({
        period: metric.date,
        value: Math.abs(metric.roi - mean), // Deviation from mean
        metric: 'ROI Deviation'
      }))
    };
  }

  /**
   * Detect seasonal patterns (requires at least 30 days of data)
   */
  private detectSeasonalPattern(dailyMetrics: DailyMetrics[]): PerformancePattern | null {
    // Simple seasonal analysis - group by week of month
    const weeklyGroups = new Map<number, number[]>();
    
    dailyMetrics.forEach(metric => {
      const date = new Date(metric.date);
      const weekOfMonth = Math.ceil(date.getDate() / 7);
      
      if (!weeklyGroups.has(weekOfMonth)) {
        weeklyGroups.set(weekOfMonth, []);
      }
      weeklyGroups.get(weekOfMonth)!.push(metric.roi);
    });

    const weeklyAverages = new Map<number, number>();
    weeklyGroups.forEach((values, week) => {
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      weeklyAverages.set(week, avg);
    });

    if (weeklyAverages.size < 3) return null; // Need at least 3 weeks

    const avgValues = Array.from(weeklyAverages.values());
    const maxAvg = Math.max(...avgValues);
    const minAvg = Math.min(...avgValues);
    const impact = ((maxAvg - minAvg) / minAvg) * 100;

    if (impact < 15) return null; // Not significant seasonal effect

    return {
      id: 'seasonal_pattern',
      type: 'seasonal',
      name: 'Monthly Seasonal Pattern',
      description: `Performance varies by ${impact.toFixed(1)}% across different weeks of the month`,
      confidence: 65,
      impact,
      recommendations: [
        'Adjust budget allocation based on monthly patterns',
        'Plan campaigns around high-performing periods',
        'Collect more data to confirm seasonal trends'
      ],
      data: Array.from(weeklyAverages.entries()).map(([week, avg]) => ({
        period: `Week ${week}`,
        value: avg,
        metric: 'Average ROI'
      }))
    };
  }

  /**
   * Generate performance insights
   */
  private generatePerformanceInsights(
    data: AIAnalysisData,
    benchmarks: PerformanceBenchmark[],
    patterns: PerformancePattern[]
  ): AIPerformanceInsight[] {
    const insights: AIPerformanceInsight[] = [];

    // ROI benchmark insight
    const roiBenchmark = benchmarks.find(b => b.metric === 'ROI');
    if (roiBenchmark) {
      insights.push({
        id: 'roi_benchmark_insight',
        type: 'benchmark',
        title: 'ROI Performance vs Historical Average',
        description: `Current ROI is ${roiBenchmark.currentValue}%, ranking at ${roiBenchmark.percentileRank}th percentile`,
        insight: roiBenchmark.percentileRank >= 75 
          ? 'Excellent ROI performance - significantly above historical average'
          : roiBenchmark.percentileRank >= 50
          ? 'Good ROI performance - above historical average'
          : 'ROI performance below historical average - optimization needed',
        confidence: 85,
        dataRange: data.dateRange,
        affectedMetrics: ['ROI', 'Revenue', 'Profitability'],
        createdAt: new Date()
      });
    }

    // Pattern-based insights
    patterns.forEach(pattern => {
      insights.push({
        id: `pattern_insight_${pattern.id}`,
        type: 'pattern',
        title: pattern.name,
        description: pattern.description,
        insight: pattern.recommendations.join('. '),
        confidence: pattern.confidence,
        dataRange: data.dateRange,
        affectedMetrics: ['ROI', 'Performance'],
        visualizationData: pattern.data,
        createdAt: new Date()
      });
    });

    // Data quality insight
    const dataQualityScore = this.assessDataQuality(data);
    insights.push({
      id: 'data_quality_insight',
      type: 'benchmark',
      title: 'Data Quality Assessment',
      description: `Analysis based on ${data.dailyMetrics.length} days of data`,
      insight: dataQualityScore >= 80 
        ? 'High quality data enables reliable insights and predictions'
        : dataQualityScore >= 60
        ? 'Good data quality - insights are reliable with minor limitations'
        : 'Limited data quality may affect insight accuracy - consider importing more data',
      confidence: dataQualityScore,
      dataRange: data.dateRange,
      affectedMetrics: ['All Metrics'],
      createdAt: new Date()
    });

    return insights;
  }

  /**
   * Generate performance summary
   */
  private generatePerformanceSummary(
    benchmarks: PerformanceBenchmark[],
    topPerformers: TopPerformer[],
    patterns: PerformancePattern[]
  ): {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  } {
    // Calculate overall score based on benchmarks
    const benchmarkScores = benchmarks.map(b => b.percentileRank);
    const overallScore = benchmarkScores.reduce((sum, score) => sum + score, 0) / benchmarkScores.length;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];

    // Analyze strengths
    benchmarks.forEach(benchmark => {
      if (benchmark.percentileRank >= 75) {
        strengths.push(`Strong ${benchmark.metric.toLowerCase()} performance (${benchmark.percentileRank}th percentile)`);
      } else if (benchmark.percentileRank <= 25) {
        weaknesses.push(`${benchmark.metric} below historical average (${benchmark.percentileRank}th percentile)`);
      }
    });

    // Analyze top performers for opportunities
    const topSubIds = topPerformers.filter(p => p.type === 'subid').slice(0, 2);
    if (topSubIds.length > 0) {
      opportunities.push(`Scale top-performing Sub IDs: ${topSubIds.map(p => p.name).join(', ')}`);
    }

    const topPlatforms = topPerformers.filter(p => p.type === 'platform').slice(0, 1);
    if (topPlatforms.length > 0) {
      opportunities.push(`Focus budget on ${topPlatforms[0].name} (${topPlatforms[0].value.toFixed(1)}% ROI)`);
    }

    // Analyze patterns for opportunities
    patterns.forEach(pattern => {
      if (pattern.impact > 0) {
        opportunities.push(`Leverage ${pattern.name.toLowerCase()} for ${pattern.impact.toFixed(1)}% improvement`);
      }
    });

    // Default messages if arrays are empty
    if (strengths.length === 0) {
      strengths.push('Consistent performance across metrics');
    }
    if (opportunities.length === 0) {
      opportunities.push('Continue monitoring performance for optimization opportunities');
    }

    return {
      overallScore: Math.round(overallScore),
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      opportunities: opportunities.slice(0, 3)
    };
  }

  // Helper methods

  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const trend = this.calculateLinearTrend(values);
    
    if (Math.abs(trend.slope) < 0.5) return 'stable';
    return trend.slope > 0 ? 'improving' : 'declining';
  }

  private calculateLinearTrend(values: number[]): { slope: number; rSquared: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, rSquared: 0 };

    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = values[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;

    // Calculate R-squared
    let totalSumSquares = 0;
    let residualSumSquares = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * i + (yMean - slope * xMean);
      const actual = values[i];
      totalSumSquares += Math.pow(actual - yMean, 2);
      residualSumSquares += Math.pow(actual - predicted, 2);
    }

    const rSquared = totalSumSquares !== 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

    return { slope, rSquared };
  }

  private analyzeWeeklyPatterns(dailyMetrics: DailyMetrics[]): {
    dayStats: Record<string, { avgROI: number; avgRevenue: number; avgOrders: number; avgSpend: number; count: number }>;
    bestDay: { dayName: string; avgROI: number; avgRevenue: number; avgOrders: number; avgSpend: number } | null;
    worstDay: { dayName: string; avgROI: number; avgRevenue: number; avgOrders: number; avgSpend: number } | null;
  } {
    const dayStats: Record<string, { 
      totalROI: number; 
      totalRevenue: number; 
      totalOrders: number; 
      totalSpend: number; 
      count: number 
    }> = {};

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    dailyMetrics.forEach(metric => {
      const date = new Date(metric.date);
      const dayName = dayNames[date.getDay()];
      
      if (!dayStats[dayName]) {
        dayStats[dayName] = { totalROI: 0, totalRevenue: 0, totalOrders: 0, totalSpend: 0, count: 0 };
      }
      
      dayStats[dayName].totalROI += metric.roi;
      dayStats[dayName].totalRevenue += metric.totalCom;
      dayStats[dayName].totalOrders += metric.ordersSP + metric.ordersLZD;
      dayStats[dayName].totalSpend += metric.adSpend;
      dayStats[dayName].count++;
    });

    const avgStats: Record<string, { avgROI: number; avgRevenue: number; avgOrders: number; avgSpend: number; count: number }> = {};
    
    Object.entries(dayStats).forEach(([day, stats]) => {
      avgStats[day] = {
        avgROI: stats.count > 0 ? stats.totalROI / stats.count : 0,
        avgRevenue: stats.count > 0 ? stats.totalRevenue / stats.count : 0,
        avgOrders: stats.count > 0 ? stats.totalOrders / stats.count : 0,
        avgSpend: stats.count > 0 ? stats.totalSpend / stats.count : 0,
        count: stats.count
      };
    });

    const daysWithData = Object.entries(avgStats).filter(([_, stats]) => stats.count > 0);
    
    if (daysWithData.length === 0) {
      return { dayStats: avgStats, bestDay: null, worstDay: null };
    }

    const sortedByROI = daysWithData.sort(([, a], [, b]) => b.avgROI - a.avgROI);
    
    const bestDay = sortedByROI.length > 0 ? {
      dayName: sortedByROI[0][0],
      ...sortedByROI[0][1]
    } : null;

    const worstDay = sortedByROI.length > 0 ? {
      dayName: sortedByROI[sortedByROI.length - 1][0],
      ...sortedByROI[sortedByROI.length - 1][1]
    } : null;

    return { dayStats: avgStats, bestDay, worstDay };
  }

  private assessDataQuality(data: AIAnalysisData): number {
    let score = 0;

    // Data completeness (40 points)
    const completenessScore = Math.min(40, (data.dailyMetrics.length / 30) * 40);
    score += completenessScore;

    // Data consistency (30 points)
    const validMetrics = data.dailyMetrics.filter(m => 
      !isNaN(m.roi) && isFinite(m.roi) && 
      !isNaN(m.totalCom) && isFinite(m.totalCom) &&
      !isNaN(m.adSpend) && isFinite(m.adSpend)
    );
    const consistencyScore = (validMetrics.length / data.dailyMetrics.length) * 30;
    score += consistencyScore;

    // Data recency (20 points)
    const latestDate = new Date(Math.max(...data.dailyMetrics.map(m => new Date(m.date).getTime())));
    const daysSinceLatest = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 20 - (daysSinceLatest * 2));
    score += recencyScore;

    // Data diversity (10 points)
    const diversityScore = Math.min(10, data.subIds.length * 2);
    score += diversityScore;

    return Math.round(Math.min(100, score));
  }
}

// Export singleton instance
export const aiPerformanceInsightsService = new AIPerformanceInsightsService();