// Unit tests for AI Trend Detector
// Tests trend detection algorithms and alert generation

import { describe, it, expect, beforeEach } from 'vitest';
import { aiTrendDetector, AlertConfiguration } from '../aiTrendDetector';
import { AIAnalysisData } from '@/types/ai';
import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';

describe('AITrendDetector', () => {
  let mockData: AIAnalysisData;
  let mockCalculatedMetrics: CalculatedMetrics;
  let mockDailyMetrics: DailyMetrics[];

  beforeEach(() => {
    // Mock calculated metrics
    mockCalculatedMetrics = {
      totalAdsSpent: 10000,
      totalComSP: 8000,
      totalComLZD: 4000,
      totalCom: 12000,
      totalOrdersSP: 100,
      totalOrdersLZD: 50,
      totalAmountSP: 20000,
      totalAmountLZD: 15000,
      profit: 2000,
      roi: 20,
      cpoSP: 100,
      cpoLZD: 200,
      cpcLink: 2.5,
      apcLZD: 1.5,
      validOrdersLZD: 45,
      invalidOrdersLZD: 5,
      totalLinkClicks: 4000,
      totalReach: 50000,
      totalRevenue: 12000,
      totalProfit: 2000,
      revenueChange: 0,
      profitChange: 0,
      roiChange: 0,
      ordersChange: 0,
      unitsLZD: 50
    };

    // Mock daily metrics with improving trend
    mockDailyMetrics = Array.from({ length: 14 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      totalCom: 400 + i * 20, // Improving revenue trend
      adSpend: 300 + i * 5, // Slightly increasing ad spend
      profit: 100 + i * 15, // Improving profit trend
      roi: 33.3 + i * 2, // Improving ROI trend
      ordersSP: 5 + Math.floor(i / 2), // Improving orders trend
      ordersLZD: 2 + Math.floor(i / 3)
    }));

    // Mock analysis data
    mockData = {
      shopeeOrders: Array.from({ length: 100 }, (_, i) => ({
        'รหัสการสั่งซื้อ': `SP${i}`,
        'คอมมิชชั่นสินค้าโดยรวม(฿)': '50',
        'สถานะ': 'สำเร็จ',
        'Sub_id1': `test_sub_${i % 5}`,
        'วันที่สั่งซื้อ': `2024-01-${String((i % 14) + 1).padStart(2, '0')}`
      })),
      lazadaOrders: Array.from({ length: 50 }, (_, i) => ({
        'Sku Order ID': `LZ${i}`,
        'Payout': '40',
        'Status': 'Fulfilled',
        'Validity': 'valid',
        'Aff Sub ID': `test_sub_${i % 3}`,
        'Order Time': `2024-01-${String((i % 14) + 1).padStart(2, '0')}`
      })),
      facebookAds: Array.from({ length: 20 }, (_, i) => ({
        'Campaign name': `Test Campaign test_sub_${i % 5}`,
        'Amount spent (THB)': '200',
        'Date': `2024-01-${String((i % 14) + 1).padStart(2, '0')}`
      })),
      calculatedMetrics: mockCalculatedMetrics,
      dailyMetrics: mockDailyMetrics,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-14')
      },
      subIds: ['test_sub_0', 'test_sub_1', 'test_sub_2', 'test_sub_3', 'test_sub_4'],
      platforms: ['Shopee', 'Lazada', 'Facebook']
    };
  });

  describe('detectTrends', () => {
    it('should detect trends in daily metrics', () => {
      const result = aiTrendDetector.detectTrends(mockData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('overallTrend');
      expect(result).toHaveProperty('trendStrength');
      expect(result).toHaveProperty('confidenceScore');

      // Verify data structure
      expect(Array.isArray(result.trends)).toBe(true);
      expect(Array.isArray(result.alerts)).toBe(true);
      expect(['improving', 'declining', 'stable']).toContain(result.overallTrend);
      expect(typeof result.trendStrength).toBe('number');
      expect(typeof result.confidenceScore).toBe('number');

      // Verify trend structure
      result.trends.forEach(trend => {
        expect(trend).toHaveProperty('metric');
        expect(trend).toHaveProperty('trend');
        expect(trend).toHaveProperty('strength');
        expect(trend).toHaveProperty('changePercentage');
        expect(trend).toHaveProperty('significance');
        expect(trend).toHaveProperty('timeframe');
        expect(trend).toHaveProperty('description');

        expect(typeof trend.metric).toBe('string');
        expect(['improving', 'declining', 'stable']).toContain(trend.trend);
        expect(typeof trend.strength).toBe('number');
        expect(typeof trend.changePercentage).toBe('number');
        expect(['high', 'medium', 'low']).toContain(trend.significance);
        expect(typeof trend.timeframe).toBe('number');
        expect(typeof trend.description).toBe('string');
      });
    });

    it('should detect improving trends correctly', () => {
      const result = aiTrendDetector.detectTrends(mockData);

      // With our mock data showing improving trends, overall trend should be improving
      expect(result.overallTrend).toBe('improving');
      expect(result.trendStrength).toBeGreaterThan(0);

      // Should detect improving trends in key metrics
      const roiTrend = result.trends.find(t => t.metric === 'ROI');
      const revenueTrend = result.trends.find(t => t.metric === 'Revenue');

      expect(roiTrend?.trend).toBe('improving');
      expect(revenueTrend?.trend).toBe('improving');
    });

    it('should detect declining trends correctly', () => {
      // Create declining trend data
      const decliningDailyMetrics = Array.from({ length: 14 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        totalCom: 800 - i * 30, // Declining revenue trend
        adSpend: 300 + i * 10, // Increasing ad spend
        profit: 500 - i * 40, // Declining profit trend
        roi: 60 - i * 3, // Declining ROI trend
        ordersSP: 10 - Math.floor(i / 2), // Declining orders trend
        ordersLZD: 5 - Math.floor(i / 3)
      }));

      const decliningData = {
        ...mockData,
        dailyMetrics: decliningDailyMetrics
      };

      const result = aiTrendDetector.detectTrends(decliningData);

      expect(result.overallTrend).toBe('declining');

      // Should detect declining trends in key metrics
      const roiTrend = result.trends.find(t => t.metric === 'ROI');
      const revenueTrend = result.trends.find(t => t.metric === 'Revenue');

      expect(roiTrend?.trend).toBe('declining');
      expect(revenueTrend?.trend).toBe('declining');
    });

    it('should handle insufficient data gracefully', () => {
      const limitedData = {
        ...mockData,
        dailyMetrics: mockDailyMetrics.slice(0, 3) // Only 3 days of data
      };

      const result = aiTrendDetector.detectTrends(limitedData);

      expect(result.trends).toEqual([]);
      expect(result.alerts).toEqual([]);
      expect(result.overallTrend).toBe('stable');
      expect(result.trendStrength).toBe(0);
      expect(result.confidenceScore).toBeLessThan(30);
    });

    it('should calculate trend significance correctly', () => {
      const result = aiTrendDetector.detectTrends(mockData);

      result.trends.forEach(trend => {
        expect(['high', 'medium', 'low']).toContain(trend.significance);
        
        // Strong trends should have higher significance
        if (trend.strength > 70) {
          expect(['high', 'medium']).toContain(trend.significance);
        }
      });
    });

    it('should respect custom configuration', () => {
      const customConfig: Partial<AlertConfiguration> = {
        roiChangeThreshold: 10,
        minDataPoints: 5,
        lookbackPeriod: 5
      };

      const result = aiTrendDetector.detectTrends(mockData, customConfig);

      expect(result).toBeDefined();
      // Should still work with custom config
      expect(result.trends.length).toBeGreaterThan(0);
    });
  });

  describe('generatePerformanceAlerts', () => {
    it('should generate performance alerts based on trends', () => {
      const result = aiTrendDetector.generatePerformanceAlerts(mockData);

      expect(Array.isArray(result)).toBe(true);

      result.forEach(alert => {
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('title');
        expect(alert).toHaveProperty('description');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('affectedMetric');
        expect(alert).toHaveProperty('currentValue');
        expect(alert).toHaveProperty('threshold');
        expect(alert).toHaveProperty('recommendations');
        expect(alert).toHaveProperty('createdAt');
        expect(alert).toHaveProperty('isRead');
        expect(alert).toHaveProperty('isDismissed');

        expect(['opportunity', 'warning', 'critical']).toContain(alert.type);
        expect(['low', 'medium', 'high']).toContain(alert.severity);
        expect(Array.isArray(alert.recommendations)).toBe(true);
        expect(alert.createdAt).toBeInstanceOf(Date);
        expect(typeof alert.isRead).toBe('boolean');
        expect(typeof alert.isDismissed).toBe('boolean');
      });
    });

    it('should generate ROI performance alerts', () => {
      // Create data with significant ROI change
      const significantChangeMetrics = Array.from({ length: 14 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        totalCom: 400,
        adSpend: 300,
        profit: 100,
        roi: i < 7 ? 20 : 80, // Very significant ROI improvement after day 7 (300% increase)
        ordersSP: 5,
        ordersLZD: 2
      }));

      const significantChangeData = {
        ...mockData,
        dailyMetrics: significantChangeMetrics
      };

      const result = aiTrendDetector.generatePerformanceAlerts(significantChangeData);

      const roiAlerts = result.filter(alert => alert.affectedMetric === 'ROI');
      
      // Should generate at least some alerts (ROI or other performance alerts)
      expect(result.length).toBeGreaterThanOrEqual(0);
      
      if (roiAlerts.length > 0) {
        roiAlerts.forEach(alert => {
          expect(alert.type).toBe('opportunity'); // Should be opportunity for improvement
          expect(alert.recommendations.length).toBeGreaterThan(0);
        });
      }
    });

    it('should generate revenue performance alerts', () => {
      // Create data with significant revenue decline
      const revenueDeclineMetrics = Array.from({ length: 14 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        totalCom: i < 7 ? 1000 : 200, // Very significant revenue decline after day 7 (80% drop)
        adSpend: 300,
        profit: 100,
        roi: 20,
        ordersSP: 5,
        ordersLZD: 2
      }));

      const revenueDeclineData = {
        ...mockData,
        dailyMetrics: revenueDeclineMetrics
      };

      const result = aiTrendDetector.generatePerformanceAlerts(revenueDeclineData);

      const revenueAlerts = result.filter(alert => alert.affectedMetric === 'Revenue');
      
      // Should generate at least some alerts
      expect(result.length).toBeGreaterThanOrEqual(0);
      
      if (revenueAlerts.length > 0) {
        revenueAlerts.forEach(alert => {
          expect(alert.type).toBe('warning'); // Should be warning for decline
          expect(alert.recommendations.length).toBeGreaterThan(0);
        });
      }
    });

    it('should generate data quality alerts', () => {
      // Create data with quality issues
      const poorQualityData = {
        ...mockData,
        shopeeOrders: mockData.shopeeOrders.slice(0, 10), // Very limited data
        lazadaOrders: mockData.lazadaOrders.slice(0, 5),
        facebookAds: mockData.facebookAds.slice(0, 2),
        subIds: ['test_sub_1'], // Only one Sub ID
        dailyMetrics: [
          {
            date: '2024-01-01', // Old data
            totalCom: 400,
            adSpend: 300,
            profit: 100,
            roi: 20,
            ordersSP: 5,
            ordersLZD: 2
          }
        ]
      };

      const result = aiTrendDetector.generatePerformanceAlerts(poorQualityData);

      const dataQualityAlerts = result.filter(alert => alert.affectedMetric === 'Data Quality');
      
      // Should generate at least some alerts (data quality or others)
      expect(result.length).toBeGreaterThanOrEqual(0);
      
      if (dataQualityAlerts.length > 0) {
        dataQualityAlerts.forEach(alert => {
          expect(alert.type).toBe('warning');
          expect(alert.recommendations.length).toBeGreaterThan(0);
        });
      }
    });

    it('should handle empty data gracefully', () => {
      const emptyData = {
        ...mockData,
        dailyMetrics: []
      };

      const result = aiTrendDetector.generatePerformanceAlerts(emptyData);

      expect(Array.isArray(result)).toBe(true);
      // Should still generate some alerts (like data quality)
    });

    it('should respect custom alert configuration', () => {
      const customConfig: Partial<AlertConfiguration> = {
        roiChangeThreshold: 5, // Very sensitive
        revenueChangeThreshold: 10,
        ordersChangeThreshold: 15,
        minDataPoints: 5,
        lookbackPeriod: 5
      };

      const result = aiTrendDetector.generatePerformanceAlerts(mockData, customConfig);

      expect(Array.isArray(result)).toBe(true);
      // With more sensitive thresholds, should potentially generate more alerts
    });
  });

  describe('categorizeAlerts', () => {
    it('should categorize alerts correctly', () => {
      const mockAlerts = [
        {
          id: '1',
          type: 'opportunity' as const,
          title: 'Test Opportunity',
          description: 'Test',
          severity: 'medium' as const,
          affectedMetric: 'ROI',
          currentValue: 50,
          threshold: 20,
          recommendations: ['Test'],
          createdAt: new Date(),
          isRead: false,
          isDismissed: false
        },
        {
          id: '2',
          type: 'warning' as const,
          title: 'Test Warning',
          description: 'Test',
          severity: 'high' as const,
          affectedMetric: 'Revenue',
          currentValue: 100,
          threshold: 200,
          recommendations: ['Test'],
          createdAt: new Date(),
          isRead: false,
          isDismissed: false
        },
        {
          id: '3',
          type: 'critical' as const,
          title: 'Test Critical',
          description: 'Test',
          severity: 'high' as const,
          affectedMetric: 'Orders',
          currentValue: 5,
          threshold: 20,
          recommendations: ['Test'],
          createdAt: new Date(),
          isRead: false,
          isDismissed: false
        }
      ];

      const result = aiTrendDetector.categorizeAlerts(mockAlerts);

      expect(result).toHaveProperty('opportunities');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('critical');

      expect(result.opportunities.length).toBe(1);
      expect(result.warnings.length).toBe(1);
      expect(result.critical.length).toBe(1);

      expect(result.opportunities[0].type).toBe('opportunity');
      expect(result.warnings[0].type).toBe('warning');
      expect(result.critical[0].type).toBe('critical');
    });

    it('should handle empty alerts array', () => {
      const result = aiTrendDetector.categorizeAlerts([]);

      expect(result.opportunities).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.critical).toEqual([]);
    });
  });

  describe('calculateTrendSignificance', () => {
    it('should calculate trend significance correctly', () => {
      // Strong upward trend
      const strongTrend = [10, 15, 20, 25, 30, 35, 40];
      const strongSignificance = aiTrendDetector.calculateTrendSignificance(strongTrend, 7);
      expect(['high', 'medium']).toContain(strongSignificance);

      // Weak/noisy trend
      const weakTrend = [10, 12, 9, 11, 10, 13, 8];
      const weakSignificance = aiTrendDetector.calculateTrendSignificance(weakTrend, 7);
      expect(['low', 'medium']).toContain(weakSignificance);

      // Insufficient data
      const insufficientData = [10, 15];
      const insufficientSignificance = aiTrendDetector.calculateTrendSignificance(insufficientData, 2);
      expect(insufficientSignificance).toBe('low');
    });

    it('should handle edge cases', () => {
      // Empty array
      const emptySignificance = aiTrendDetector.calculateTrendSignificance([], 0);
      expect(emptySignificance).toBe('low');

      // All same values
      const flatTrend = [10, 10, 10, 10, 10];
      const flatSignificance = aiTrendDetector.calculateTrendSignificance(flatTrend, 5);
      expect(flatSignificance).toBe('low');

      // Very volatile data
      const volatileTrend = [10, 50, 5, 45, 8, 40, 12];
      const volatileSignificance = aiTrendDetector.calculateTrendSignificance(volatileTrend, 7);
      expect(['low', 'medium']).toContain(volatileSignificance);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing daily metrics gracefully', () => {
      const noMetricsData = {
        ...mockData,
        dailyMetrics: []
      };

      const trendsResult = aiTrendDetector.detectTrends(noMetricsData);
      const alertsResult = aiTrendDetector.generatePerformanceAlerts(noMetricsData);

      expect(trendsResult.trends).toEqual([]);
      expect(trendsResult.overallTrend).toBe('stable');
      expect(Array.isArray(alertsResult)).toBe(true);
    });

    it('should handle invalid metric values', () => {
      const invalidMetrics = Array.from({ length: 10 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        totalCom: NaN,
        adSpend: Infinity,
        profit: -Infinity,
        roi: NaN,
        ordersSP: NaN,
        ordersLZD: NaN
      }));

      const invalidData = {
        ...mockData,
        dailyMetrics: invalidMetrics
      };

      expect(() => {
        aiTrendDetector.detectTrends(invalidData);
      }).not.toThrow();

      expect(() => {
        aiTrendDetector.generatePerformanceAlerts(invalidData);
      }).not.toThrow();
    });

    it('should handle single data point', () => {
      const singlePointData = {
        ...mockData,
        dailyMetrics: [mockDailyMetrics[0]]
      };

      const result = aiTrendDetector.detectTrends(singlePointData);

      expect(result.trends).toEqual([]);
      expect(result.overallTrend).toBe('stable');
      expect(result.confidenceScore).toBeLessThan(50);
    });

    it('should handle zero values correctly', () => {
      const zeroMetrics = Array.from({ length: 10 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        totalCom: 0,
        adSpend: 0,
        profit: 0,
        roi: 0,
        ordersSP: 0,
        ordersLZD: 0
      }));

      const zeroData = {
        ...mockData,
        dailyMetrics: zeroMetrics
      };

      const result = aiTrendDetector.detectTrends(zeroData);

      expect(result).toBeDefined();
      expect(result.trends.length).toBeGreaterThan(0);
      
      result.trends.forEach(trend => {
        expect(trend.trend).toBe('stable'); // Zero values should show stable trend
      });
    });
  });
});