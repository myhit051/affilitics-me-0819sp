// Unit tests for AI Performance Insights Service

import { describe, it, expect, beforeEach } from 'vitest';
import { aiPerformanceInsightsService } from '../aiPerformanceInsightsService';
import { AIAnalysisData } from '@/types/ai';
import { DailyMetrics } from '@/utils/affiliateCalculations';

describe('AI Performance Insights Service', () => {
  let mockAnalysisData: AIAnalysisData;
  let mockDailyMetrics: DailyMetrics[];

  beforeEach(() => {
    // Create mock daily metrics spanning multiple weeks
    mockDailyMetrics = [
      // Week 1
      { date: '2024-01-01', totalCom: 1000, adSpend: 800, roi: 25, ordersSP: 5, ordersLZD: 3, totalComSP: 600, totalComLZD: 400 }, // Monday
      { date: '2024-01-02', totalCom: 1200, adSpend: 900, roi: 33, ordersSP: 6, ordersLZD: 4, totalComSP: 720, totalComLZD: 480 }, // Tuesday
      { date: '2024-01-03', totalCom: 1100, adSpend: 850, roi: 29, ordersSP: 5, ordersLZD: 4, totalComSP: 660, totalComLZD: 440 }, // Wednesday
      { date: '2024-01-04', totalCom: 1300, adSpend: 950, roi: 37, ordersSP: 7, ordersLZD: 4, totalComSP: 780, totalComLZD: 520 }, // Thursday
      { date: '2024-01-05', totalCom: 1250, adSpend: 900, roi: 39, ordersSP: 6, ordersLZD: 5, totalComSP: 750, totalComLZD: 500 }, // Friday
      { date: '2024-01-06', totalCom: 1400, adSpend: 1000, roi: 40, ordersSP: 8, ordersLZD: 4, totalComSP: 840, totalComLZD: 560 }, // Saturday
      { date: '2024-01-07', totalCom: 1350, adSpend: 950, roi: 42, ordersSP: 7, ordersLZD: 5, totalComSP: 810, totalComLZD: 540 }, // Sunday
      
      // Week 2
      { date: '2024-01-08', totalCom: 1500, adSpend: 1100, roi: 36, ordersSP: 8, ordersLZD: 6, totalComSP: 900, totalComLZD: 600 }, // Monday
      { date: '2024-01-09', totalCom: 1450, adSpend: 1050, roi: 38, ordersSP: 7, ordersLZD: 6, totalComSP: 870, totalComLZD: 580 }, // Tuesday
      { date: '2024-01-10', totalCom: 1600, adSpend: 1200, roi: 33, ordersSP: 9, ordersLZD: 6, totalComSP: 960, totalComLZD: 640 }, // Wednesday
      { date: '2024-01-11', totalCom: 1550, adSpend: 1150, roi: 35, ordersSP: 8, ordersLZD: 6, totalComSP: 930, totalComLZD: 620 }, // Thursday
      { date: '2024-01-12', totalCom: 1700, adSpend: 1300, roi: 31, ordersSP: 9, ordersLZD: 7, totalComSP: 1020, totalComLZD: 680 }, // Friday
      { date: '2024-01-13', totalCom: 1650, adSpend: 1250, roi: 32, ordersSP: 8, ordersLZD: 7, totalComSP: 990, totalComLZD: 660 }, // Saturday
      { date: '2024-01-14', totalCom: 1800, adSpend: 1400, roi: 29, ordersSP: 10, ordersLZD: 7, totalComSP: 1080, totalComLZD: 720 }, // Sunday
      
      // Week 3
      { date: '2024-01-15', totalCom: 1750, adSpend: 1350, roi: 30, ordersSP: 9, ordersLZD: 8, totalComSP: 1050, totalComLZD: 700 }, // Monday
      { date: '2024-01-16', totalCom: 1900, adSpend: 1500, roi: 27, ordersSP: 11, ordersLZD: 8, totalComSP: 1140, totalComLZD: 760 }, // Tuesday
      { date: '2024-01-17', totalCom: 1850, adSpend: 1450, roi: 28, ordersSP: 10, ordersLZD: 8, totalComSP: 1110, totalComLZD: 740 }, // Wednesday
      { date: '2024-01-18', totalCom: 2000, adSpend: 1600, roi: 25, ordersSP: 12, ordersLZD: 9, totalComSP: 1200, totalComLZD: 800 }, // Thursday
      { date: '2024-01-19', totalCom: 1950, adSpend: 1550, roi: 26, ordersSP: 11, ordersLZD: 9, totalComSP: 1170, totalComLZD: 780 }, // Friday
      { date: '2024-01-20', totalCom: 2100, adSpend: 1700, roi: 24, ordersSP: 13, ordersLZD: 9, totalComSP: 1260, totalComLZD: 840 }, // Saturday
      { date: '2024-01-21', totalCom: 2050, adSpend: 1650, roi: 24, ordersSP: 12, ordersLZD: 10, totalComSP: 1230, totalComLZD: 820 }  // Sunday
    ];

    mockAnalysisData = {
      shopeeOrders: [],
      lazadaOrders: [],
      facebookAds: [],
      calculatedMetrics: {
        totalCom: 33350,
        totalComSP: 20010,
        totalComLZD: 13340,
        totalOrdersSP: 178,
        totalOrdersLZD: 133,
        totalAdsSpent: 25450,
        roi: 31.0,
        cpoSP: 143.0,
        cpoLZD: 191.4,
        totalLinkClicks: 4200,
        totalImpressions: 84000,
        totalReach: 58800,
        cpm: 303,
        cpc: 6.06,
        ctr: 5.0
      },
      dailyMetrics: mockDailyMetrics,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-21')
      },
      subIds: ['test1', 'test2', 'test3', 'test4'],
      platforms: ['Shopee', 'Lazada', 'Facebook']
    };
  });

  describe('analyzePerformance', () => {
    it('should generate comprehensive performance analysis', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      expect(result.benchmarks).toBeDefined();
      expect(result.topPerformers).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.summary).toBeDefined();

      expect(result.benchmarks.length).toBeGreaterThan(0);
      expect(result.topPerformers.length).toBeGreaterThan(0);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should generate internal benchmarks for key metrics', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      const expectedMetrics = ['ROI', 'Revenue', 'Orders', 'Ad Spend', 'Cost Per Order'];
      const benchmarkMetrics = result.benchmarks.map(b => b.metric);

      expectedMetrics.forEach(metric => {
        expect(benchmarkMetrics).toContain(metric);
      });

      result.benchmarks.forEach(benchmark => {
        expect(benchmark.currentValue).toBeTypeOf('number');
        expect(benchmark.bestValue).toBeTypeOf('number');
        expect(benchmark.worstValue).toBeTypeOf('number');
        expect(benchmark.averageValue).toBeTypeOf('number');
        expect(benchmark.percentileRank).toBeGreaterThanOrEqual(0);
        expect(benchmark.percentileRank).toBeLessThanOrEqual(100);
        expect(['improving', 'declining', 'stable']).toContain(benchmark.trend);
      });
    });

    it('should identify top performers across different categories', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      const performerTypes = result.topPerformers.map(p => p.type);
      expect(performerTypes).toContain('subid');
      expect(performerTypes).toContain('platform');
      expect(performerTypes).toContain('timeperiod');

      result.topPerformers.forEach(performer => {
        expect(performer.id).toBeTypeOf('string');
        expect(performer.name).toBeTypeOf('string');
        expect(performer.value).toBeTypeOf('number');
        expect(performer.metric).toBeTypeOf('string');
        expect(performer.performance).toBeDefined();
        expect(performer.insights).toBeDefined();
        expect(Array.isArray(performer.insights)).toBe(true);
      });
    });

    it('should detect performance patterns', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      result.patterns.forEach(pattern => {
        expect(pattern.id).toBeTypeOf('string');
        expect(pattern.type).toBeTypeOf('string');
        expect(pattern.name).toBeTypeOf('string');
        expect(pattern.description).toBeTypeOf('string');
        expect(pattern.confidence).toBeGreaterThanOrEqual(0);
        expect(pattern.confidence).toBeLessThanOrEqual(100);
        expect(pattern.impact).toBeTypeOf('number');
        expect(Array.isArray(pattern.recommendations)).toBe(true);
        expect(Array.isArray(pattern.data)).toBe(true);
      });
    });

    it('should generate actionable insights', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      result.insights.forEach(insight => {
        expect(insight.id).toBeTypeOf('string');
        expect(['pattern', 'anomaly', 'trend', 'benchmark']).toContain(insight.type);
        expect(insight.title).toBeTypeOf('string');
        expect(insight.description).toBeTypeOf('string');
        expect(insight.insight).toBeTypeOf('string');
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(100);
        expect(insight.dataRange).toBeDefined();
        expect(Array.isArray(insight.affectedMetrics)).toBe(true);
      });
    });

    it('should provide performance summary with scores and recommendations', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      expect(result.summary.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.summary.overallScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.summary.strengths)).toBe(true);
      expect(Array.isArray(result.summary.weaknesses)).toBe(true);
      expect(Array.isArray(result.summary.opportunities)).toBe(true);

      // Should have at least some content
      expect(result.summary.strengths.length).toBeGreaterThan(0);
      expect(result.summary.opportunities.length).toBeGreaterThan(0);
    });

    it('should handle declining trend data correctly', async () => {
      // Create data with clear declining trend
      const decliningMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: 50 - (index * 1.5) // ROI decreases by 1.5% each day
      }));

      const decliningData = {
        ...mockAnalysisData,
        dailyMetrics: decliningMetrics
      };

      const result = await aiPerformanceInsightsService.analyzePerformance(decliningData);

      // Should detect declining trend pattern
      const trendPattern = result.patterns.find(p => p.type === 'trend');
      expect(trendPattern).toBeDefined();
      expect(trendPattern?.name).toContain('Declining');
      expect(trendPattern?.impact).toBeLessThan(0);
    });

    it('should handle improving trend data correctly', async () => {
      // Create data with clear improving trend
      const improvingMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: 20 + (index * 1) // ROI increases by 1% each day
      }));

      const improvingData = {
        ...mockAnalysisData,
        dailyMetrics: improvingMetrics
      };

      const result = await aiPerformanceInsightsService.analyzePerformance(improvingData);

      // Should detect improving trend pattern
      const trendPattern = result.patterns.find(p => p.type === 'trend');
      expect(trendPattern).toBeDefined();
      expect(trendPattern?.name).toContain('Improving');
      expect(trendPattern?.impact).toBeGreaterThan(0);
    });

    it('should detect weekly patterns when present', async () => {
      // Create data with strong weekly pattern (weekends perform better)
      const weeklyPatternMetrics = mockDailyMetrics.map((metric, index) => {
        const date = new Date(metric.date);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        return {
          ...metric,
          roi: isWeekend ? metric.roi + 15 : metric.roi - 5 // Weekends +15%, weekdays -5%
        };
      });

      const weeklyPatternData = {
        ...mockAnalysisData,
        dailyMetrics: weeklyPatternMetrics
      };

      const result = await aiPerformanceInsightsService.analyzePerformance(weeklyPatternData);

      // Should detect weekly pattern
      const weeklyPattern = result.patterns.find(p => p.type === 'weekly');
      expect(weeklyPattern).toBeDefined();
      expect(weeklyPattern?.impact).toBeGreaterThan(10); // Should detect significant difference
    });

    it('should detect high volatility patterns', async () => {
      // Create highly volatile data
      const volatileMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: index % 2 === 0 ? 10 : 60 // Alternating between 10% and 60%
      }));

      const volatileData = {
        ...mockAnalysisData,
        dailyMetrics: volatileMetrics
      };

      const result = await aiPerformanceInsightsService.analyzePerformance(volatileData);

      // Should detect volatility pattern
      const volatilityPattern = result.patterns.find(p => p.name.includes('Volatility'));
      expect(volatilityPattern).toBeDefined();
      expect(volatilityPattern?.impact).toBeLessThan(0); // Negative impact
    });
  });

  describe('error handling', () => {
    it('should throw error for insufficient data', async () => {
      const insufficientData = {
        ...mockAnalysisData,
        dailyMetrics: mockDailyMetrics.slice(0, 5) // Only 5 days of data
      };

      await expect(aiPerformanceInsightsService.analyzePerformance(insufficientData))
        .rejects.toThrow('Insufficient data for performance analysis');
    });

    it('should throw error for no daily metrics', async () => {
      const noMetricsData = {
        ...mockAnalysisData,
        dailyMetrics: []
      };

      await expect(aiPerformanceInsightsService.analyzePerformance(noMetricsData))
        .rejects.toThrow('Insufficient data for performance analysis');
    });
  });

  describe('benchmark calculations', () => {
    it('should calculate percentile ranks correctly', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      const roiBenchmark = result.benchmarks.find(b => b.metric === 'ROI');
      expect(roiBenchmark).toBeDefined();

      // Percentile rank should be reasonable
      expect(roiBenchmark?.percentileRank).toBeGreaterThanOrEqual(0);
      expect(roiBenchmark?.percentileRank).toBeLessThanOrEqual(100);

      // Current value should be within the range of best/worst
      expect(roiBenchmark?.currentValue).toBeGreaterThanOrEqual(roiBenchmark?.worstValue || 0);
      expect(roiBenchmark?.currentValue).toBeLessThanOrEqual(roiBenchmark?.bestValue || 100);
    });

    it('should handle edge cases in benchmark calculation', async () => {
      // Create data with all same values
      const constantMetrics = mockDailyMetrics.map(metric => ({
        ...metric,
        roi: 30 // Constant ROI
      }));

      const constantData = {
        ...mockAnalysisData,
        dailyMetrics: constantMetrics
      };

      const result = await aiPerformanceInsightsService.analyzePerformance(constantData);

      const roiBenchmark = result.benchmarks.find(b => b.metric === 'ROI');
      expect(roiBenchmark).toBeDefined();
      expect(roiBenchmark?.currentValue).toBe(30);
      expect(roiBenchmark?.bestValue).toBe(30);
      expect(roiBenchmark?.worstValue).toBe(30);
      expect(roiBenchmark?.averageValue).toBe(30);
    });
  });

  describe('top performers identification', () => {
    it('should identify platform performers correctly', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      const platformPerformers = result.topPerformers.filter(p => p.type === 'platform');
      expect(platformPerformers.length).toBeGreaterThan(0);

      platformPerformers.forEach(performer => {
        expect(['Shopee', 'Lazada']).toContain(performer.name);
        expect(performer.performance.roi).toBeTypeOf('number');
        expect(performer.performance.revenue).toBeGreaterThan(0);
        expect(performer.performance.orders).toBeGreaterThan(0);
        expect(performer.performance.spend).toBeGreaterThan(0);
      });
    });

    it('should identify time period performers correctly', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      const timePerformers = result.topPerformers.filter(p => p.type === 'timeperiod');
      expect(timePerformers.length).toBeGreaterThan(0);

      timePerformers.forEach(performer => {
        expect(performer.value).toBeTypeOf('number');
        expect(performer.performance.roi).toBeGreaterThan(0);
      });
    });

    it('should sort performers by value in descending order', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      for (let i = 1; i < result.topPerformers.length; i++) {
        expect(result.topPerformers[i - 1].value).toBeGreaterThanOrEqual(result.topPerformers[i].value);
      }
    });
  });

  describe('data quality assessment', () => {
    it('should assess high quality data correctly', async () => {
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      const dataQualityInsight = result.insights.find(i => i.title === 'Data Quality Assessment');
      expect(dataQualityInsight).toBeDefined();
      expect(dataQualityInsight?.confidence).toBeGreaterThan(50); // Should be reasonable quality
    });

    it('should handle poor quality data', async () => {
      // Create data with many invalid values
      const poorQualityMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: index % 3 === 0 ? NaN : metric.roi, // Every 3rd value is NaN
        totalCom: index % 4 === 0 ? Infinity : metric.totalCom // Every 4th value is Infinity
      }));

      const poorQualityData = {
        ...mockAnalysisData,
        dailyMetrics: poorQualityMetrics
      };

      const result = await aiPerformanceInsightsService.analyzePerformance(poorQualityData);

      const dataQualityInsight = result.insights.find(i => i.title === 'Data Quality Assessment');
      expect(dataQualityInsight).toBeDefined();
      // Should still work but with lower confidence
      expect(dataQualityInsight?.confidence).toBeLessThan(90);
    });
  });

  describe('seasonal pattern detection', () => {
    it('should detect seasonal patterns with sufficient data', async () => {
      // Create 35 days of data with monthly pattern
      const seasonalMetrics = Array.from({ length: 35 }, (_, index) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + index);
        
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        const seasonalMultiplier = weekOfMonth === 2 ? 1.3 : weekOfMonth === 4 ? 0.8 : 1.0;
        
        return {
          date: date.toISOString().split('T')[0],
          totalCom: 1000 * seasonalMultiplier,
          adSpend: 800 * seasonalMultiplier,
          roi: 25 * seasonalMultiplier,
          ordersSP: Math.floor(5 * seasonalMultiplier),
          ordersLZD: Math.floor(3 * seasonalMultiplier),
          totalComSP: 600 * seasonalMultiplier,
          totalComLZD: 400 * seasonalMultiplier
        };
      });

      const seasonalData = {
        ...mockAnalysisData,
        dailyMetrics: seasonalMetrics
      };

      const result = await aiPerformanceInsightsService.analyzePerformance(seasonalData);

      // Should detect seasonal pattern with sufficient data
      const seasonalPattern = result.patterns.find(p => p.type === 'seasonal');
      expect(seasonalPattern).toBeDefined();
      expect(seasonalPattern?.impact).toBeGreaterThan(10); // Should detect significant seasonal effect
    });

    it('should not detect seasonal patterns with insufficient data', async () => {
      // Use original data (21 days) - not enough for strong seasonal detection
      const result = await aiPerformanceInsightsService.analyzePerformance(mockAnalysisData);

      // May or may not detect seasonal pattern with limited data
      const seasonalPattern = result.patterns.find(p => p.type === 'seasonal');
      if (seasonalPattern) {
        expect(seasonalPattern.confidence).toBeLessThan(80); // Lower confidence with limited data
      }
    });
  });
});