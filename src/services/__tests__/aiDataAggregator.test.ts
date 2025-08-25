// Integration tests for AI Data Aggregator Service

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiDataAggregator } from '../aiDataAggregator';
import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';

// Mock the data merger
vi.mock('@/lib/data-merger', () => ({
  dataMerger: {
    mergeAllData: vi.fn(),
    detectCrossPlatformConflicts: vi.fn(),
    stripDataSourceTracking: vi.fn((data) => data.map(item => {
      const { _dataSource, _sourceTimestamp, _sourceId, ...clean } = item;
      return clean;
    })),
    getDataSourceStatistics: vi.fn((data) => ({
      fileImport: data?.length || 0,
      facebookApi: 0,
      merged: 0,
      total: data?.length || 0
    }))
  }
}));

describe('AIDataAggregator Integration Tests', () => {
  let mockShopeeOrders: any[];
  let mockLazadaOrders: any[];
  let mockFacebookAds: any[];
  let mockCalculatedMetrics: CalculatedMetrics;
  let mockDailyMetrics: DailyMetrics[];

  beforeEach(() => {
    // Create comprehensive mock data
    mockShopeeOrders = [
      {
        'รหัสการสั่งซื้อ': 'SP001',
        'คอมมิชชั่นสินค้าโดยรวม(฿)': '150.75',
        'มูลค่าซื้อ(฿)': '750.00',
        'วันที่สั่งซื้อ': '2025-08-20',
        'เวลาที่สั่งซื้อ': '2025-08-20 10:30:00',
        'สถานะ': 'สำเร็จ',
        'ช่องทาง': 'Affiliate',
        'Sub_id1': 'campaign_001',
        'Sub_id2': 'creative_A',
        sub_id: 'campaign_001',
        _dataSource: 'file_import'
      },
      {
        'รหัสการสั่งซื้อ': 'SP002',
        'คอมมิชชั่นสินค้าโดยรวม(฿)': '89.25',
        'มูลค่าซื้อ(฿)': '445.00',
        'วันที่สั่งซื้อ': '2025-08-21',
        'สถานะ': 'สำเร็จ',
        'Sub_id1': 'campaign_002',
        sub_id: 'campaign_002',
        _dataSource: 'file_import'
      },
      {
        'รหัสการสั่งซื้อ': 'SP003',
        'คอมมิชชั่นสินค้าโดยรวม(฿)': '200.00',
        'มูลค่าซื้อ(฿)': '1000.00',
        'วันที่สั่งซื้อ': '2025-08-22',
        'สถานะ': 'สำเร็จ',
        'Sub_id1': 'campaign_001',
        sub_id: 'campaign_001',
        _dataSource: 'facebook_api'
      }
    ];

    mockLazadaOrders = [
      {
        'Check Out ID': 'LZ001',
        'Payout': '120.50',
        'Order Amount': '602.50',
        'Order Time': '2025-08-20 14:20:00',
        'Status': 'Fulfilled',
        'Validity': 'valid',
        'Aff Sub ID': 'campaign_001',
        'Sub ID': 'campaign_001',
        _dataSource: 'file_import'
      },
      {
        'Check Out ID': 'LZ002',
        'Payout': '95.75',
        'Order Amount': '478.75',
        'Order Time': '2025-08-21 16:45:00',
        'Status': 'Fulfilled',
        'Validity': 'valid',
        'Sub ID': 'campaign_002',
        _dataSource: 'file_import'
      }
    ];

    mockFacebookAds = [
      {
        'Campaign name': 'Summer Sale Campaign 001',
        'Ad set name': 'Targeting Set A',
        'Ad name': 'Creative A',
        'Amount spent (THB)': '250.00',
        'Impressions': '15000',
        'Link clicks': '750',
        'Reach': '12000',
        'CPM (cost per 1,000 impressions)': '16.67',
        'CPC (cost per link click)': '0.33',
        'CTR (link click-through rate)': '5.0',
        'Date': '2025-08-20',
        'Sub ID': 'campaign_001',
        _dataSource: 'file_import'
      },
      {
        'Campaign name': 'Back to School Campaign 002',
        'Ad set name': 'Targeting Set B',
        'Ad name': 'Creative B',
        'Amount spent (THB)': '180.00',
        'Impressions': '12000',
        'Link clicks': '600',
        'Reach': '9500',
        'Date': '2025-08-21',
        'Sub ID': 'campaign_002',
        _dataSource: 'facebook_api'
      }
    ];

    mockCalculatedMetrics = {
      totalAdsSpent: 430.00,
      totalComSP: 440.00,
      totalComLZD: 216.25,
      totalCom: 656.25,
      totalOrdersSP: 3,
      totalOrdersLZD: 2,
      totalAmountSP: 2195.00,
      totalAmountLZD: 1081.25,
      profit: 226.25,
      roi: 52.62,
      cpoSP: 143.33,
      cpoLZD: 215.00,
      cpcLink: 0.32,
      apcLZD: 2.51,
      validOrdersLZD: 2,
      invalidOrdersLZD: 0,
      totalLinkClicks: 1350,
      totalReach: 21500,
      totalRevenue: 656.25,
      totalProfit: 226.25,
      revenueChange: 0,
      profitChange: 0,
      roiChange: 0,
      ordersChange: 0,
      unitsLZD: 2
    };

    mockDailyMetrics = [
      { date: '2025-08-20', totalCom: 271.25, adSpend: 250.00, profit: 21.25, roi: 8.5, ordersSP: 1, ordersLZD: 1 },
      { date: '2025-08-21', totalCom: 185.00, adSpend: 180.00, profit: 5.00, roi: 2.78, ordersSP: 1, ordersLZD: 1 },
      { date: '2025-08-22', totalCom: 200.00, adSpend: 0, profit: 200.00, roi: 0, ordersSP: 1, ordersLZD: 0 }
    ];
  });

  describe('aggregateDataForAI', () => {
    it('should successfully aggregate data from multiple sources', async () => {
      const result = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result).toBeDefined();
      expect(result.aiData).toBeDefined();
      expect(result.aggregationStats).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.errors).toBeDefined();

      // Check AI data structure
      expect(result.aiData.shopeeOrders).toBeDefined();
      expect(result.aiData.lazadaOrders).toBeDefined();
      expect(result.aiData.facebookAds).toBeDefined();
      expect(result.aiData.calculatedMetrics).toBeDefined();
      expect(result.aiData.dailyMetrics).toBe(mockDailyMetrics);
      expect(result.aiData.subIds).toBeDefined();
      expect(result.aiData.platforms).toBeDefined();
      
      // Check that basic metrics are preserved (enhanced metrics will have additional fields)
      expect(result.aiData.calculatedMetrics.totalCom).toBe(mockCalculatedMetrics.totalCom);
      expect(result.aiData.calculatedMetrics.roi).toBe(mockCalculatedMetrics.roi);

      // Check aggregation stats
      expect(result.aggregationStats.totalRecordsProcessed).toBe(7); // 3 + 2 + 2
      expect(result.aggregationStats.dataQualityScore).toBeGreaterThan(0);
      expect(result.aggregationStats.processingTime).toBeGreaterThan(0);
    });

    it('should handle data source merging when multiple sources exist', async () => {
      // Mock the data merger to return merge results
      const { dataMerger } = await import('@/lib/data-merger');
      
      vi.mocked(dataMerger.mergeAllData).mockReturnValue({
        mergedData: {
          shopeeOrders: mockShopeeOrders,
          lazadaOrders: mockLazadaOrders,
          facebookAds: mockFacebookAds,
          campaigns: []
        },
        mergeResults: {
          shopee: { statistics: { duplicatesFound: 1, conflictsResolved: 0 } },
          lazada: { statistics: { duplicatesFound: 0, conflictsResolved: 0 } },
          facebook: { statistics: { duplicatesFound: 0, conflictsResolved: 1 } },
          campaigns: { statistics: { duplicatesFound: 0, conflictsResolved: 0 } }
        },
        overallStatistics: {
          totalOriginal: 5,
          totalNew: 2,
          totalMerged: 7,
          totalDuplicatesFound: 1,
          totalConflictsResolved: 1
        }
      });

      vi.mocked(dataMerger.detectCrossPlatformConflicts).mockReturnValue({
        conflicts: [],
        recommendations: []
      });

      const result = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.errors).toHaveLength(0);
      expect(dataMerger.mergeAllData).toHaveBeenCalled();
      expect(dataMerger.detectCrossPlatformConflicts).toHaveBeenCalled();
    });

    it('should handle merge conflicts and add warnings', async () => {
      const { dataMerger } = await import('@/lib/data-merger');
      
      vi.mocked(dataMerger.mergeAllData).mockReturnValue({
        mergedData: {
          shopeeOrders: mockShopeeOrders,
          lazadaOrders: mockLazadaOrders,
          facebookAds: mockFacebookAds,
          campaigns: []
        },
        mergeResults: {},
        overallStatistics: {
          totalOriginal: 5,
          totalNew: 2,
          totalMerged: 7,
          totalDuplicatesFound: 2,
          totalConflictsResolved: 1
        }
      });

      vi.mocked(dataMerger.detectCrossPlatformConflicts).mockReturnValue({
        conflicts: [
          {
            type: 'spend_mismatch',
            description: 'Facebook spend data conflicts with commission data',
            affectedRecords: [],
            severity: 'medium'
          }
        ],
        recommendations: ['Review data sources for consistency']
      });

      const result = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('data conflicts'))).toBe(true);
    });

    it('should handle aggregation errors gracefully', async () => {
      // Force an error by passing invalid calculated metrics
      const invalidMetrics = null as any;

      const result = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        invalidMetrics,
        mockDailyMetrics
      );

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.aiData).toBeDefined(); // Should still return fallback data
      expect(result.aggregationStats.dataQualityScore).toBeLessThan(100); // Should be penalized
    });

    it('should calculate accurate data quality scores', async () => {
      // Test with high-quality data
      const result = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.aggregationStats.dataQualityScore).toBeGreaterThanOrEqual(50);

      // Test with low-quality data (empty arrays)
      const lowQualityResult = await aiDataAggregator.aggregateDataForAI(
        [],
        [],
        [],
        mockCalculatedMetrics,
        []
      );

      expect(lowQualityResult.aggregationStats.dataQualityScore).toBeLessThan(70); // Empty data should have lower score
    });
  });

  describe('transformForAIAnalysis', () => {
    it('should transform data structures correctly', () => {
      const result = aiDataAggregator.transformForAIAnalysis(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds
      );

      expect(result.transformedShopeeOrders).toBeDefined();
      expect(result.transformedLazadaOrders).toBeDefined();
      expect(result.transformedFacebookAds).toBeDefined();
      expect(result.transformationStats).toBeDefined();

      // Check Shopee transformation
      const transformedShopee = result.transformedShopeeOrders[0];
      expect(transformedShopee.orderId).toBe('SP001');
      expect(transformedShopee.commission).toBe(150.75);
      expect(transformedShopee.platform).toBe('Shopee');
      expect(transformedShopee.subIds).toContain('campaign_001');
      expect(transformedShopee._aiProcessed).toBe(true);

      // Check Lazada transformation
      const transformedLazada = result.transformedLazadaOrders[0];
      expect(transformedLazada.orderId).toBe('LZ001');
      expect(transformedLazada.commission).toBe(120.50);
      expect(transformedLazada.platform).toBe('Lazada');
      expect(transformedLazada.subIds).toContain('campaign_001');

      // Check Facebook transformation
      const transformedFacebook = result.transformedFacebookAds[0];
      expect(transformedFacebook.campaignName).toBe('Summer Sale Campaign 001');
      expect(transformedFacebook.spend).toBe(250.00);
      expect(transformedFacebook.platform).toBe('Facebook');
      expect(transformedFacebook.subId).toBe('campaign_001');

      // Check transformation stats
      expect(result.transformationStats.shopeeTransformed).toBe(3);
      expect(result.transformationStats.lazadaTransformed).toBe(2);
      expect(result.transformationStats.facebookTransformed).toBe(2);
      expect(result.transformationStats.fieldsStandardized.length).toBeGreaterThan(0);
    });

    it('should handle malformed data gracefully', () => {
      const malformedShopeeOrders = [
        {
          'รหัสการสั่งซื้อ': 'SP001',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': 'invalid_number',
          'มูลค่าซื้อ(฿)': null,
          'วันที่สั่งซื้อ': 'invalid_date'
        }
      ];

      const result = aiDataAggregator.transformForAIAnalysis(
        malformedShopeeOrders,
        [],
        []
      );

      const transformed = result.transformedShopeeOrders[0];
      expect(transformed.commission).toBe(0); // Should default to 0
      expect(transformed.orderValue).toBe(0);
      expect(transformed.orderDate).toBeNull();
      expect(transformed._aiProcessed).toBe(true);
    });

    it('should extract Sub IDs from Facebook campaign names', () => {
      const facebookAdsWithSubIds = [
        {
          'Campaign name': 'Summer Campaign sub_id_test123',
          'Ad set name': 'Test Set',
          'Amount spent (THB)': '100',
          'Date': '2025-08-20'
        },
        {
          'Campaign name': 'campaign_abc123',
          'Ad set name': 'Test Set 2',
          'Amount spent (THB)': '150',
          'Date': '2025-08-21'
        }
      ];

      const result = aiDataAggregator.transformForAIAnalysis(
        [],
        [],
        facebookAdsWithSubIds
      );

      expect(result.transformedFacebookAds[0].subId).toBe('test123');
      expect(result.transformedFacebookAds[1].subId).toBe('abc123');
    });

    it('should handle various date formats correctly', () => {
      const ordersWithDifferentDates = [
        {
          'รหัสการสั่งซื้อ': 'SP001',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '100',
          'วันที่สั่งซื้อ': '20/08/2025', // Thai format DD/MM/YYYY
          'สถานะ': 'สำเร็จ'
        },
        {
          'รหัสการสั่งซื้อ': 'SP002',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '150',
          'เวลาที่สั่งซื้อ': '2025-08-21 14:30:00', // ISO format
          'สถานะ': 'สำเร็จ'
        },
        {
          'รหัสการสั่งซื้อ': 'SP003',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '200',
          'วันที่สั่งซื้อ': 'invalid_date', // Invalid date
          'สถานะ': 'สำเร็จ'
        }
      ];

      const result = aiDataAggregator.transformForAIAnalysis(
        ordersWithDifferentDates,
        [],
        []
      );

      const transformed = result.transformedShopeeOrders;
      expect(transformed[0].orderDate).toBeInstanceOf(Date);
      expect(transformed[1].orderDate).toBeInstanceOf(Date);
      expect(transformed[2].orderDate).toBeNull(); // Invalid date should be null
    });
  });

  describe('aggregatePerformanceMetrics', () => {
    it('should aggregate performance metrics correctly', () => {
      const result = aiDataAggregator.aggregatePerformanceMetrics(
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.aggregatedMetrics).toBeDefined();
      expect(result.performanceInsights).toBeDefined();

      // Check enhanced metrics
      const metrics = result.aggregatedMetrics;
      expect(metrics.roiTrend).toBeDefined();
      expect(metrics.revenueTrend).toBeDefined();
      expect(metrics.ordersTrend).toBeDefined();
      expect(metrics.costPerOrder).toBeGreaterThan(0);
      expect(metrics.revenuePerOrder).toBeGreaterThan(0);
      expect(metrics.conversionRate).toBeGreaterThan(0);

      // Check platform performance
      expect(metrics.platformPerformance.shopee).toBeDefined();
      expect(metrics.platformPerformance.lazada).toBeDefined();
      expect(metrics.platformPerformance.facebook).toBeDefined();

      // Check data quality assessment
      expect(metrics.dataQuality.completeness).toBeGreaterThanOrEqual(0);
      expect(metrics.dataQuality.consistency).toBeGreaterThanOrEqual(0);
      expect(metrics.dataQuality.freshness).toBeGreaterThanOrEqual(0);
      expect(metrics.dataQuality.reliability).toBeGreaterThanOrEqual(0);

      // Check performance insights
      const insights = result.performanceInsights;
      expect(insights.topPerformingPlatform).toBeDefined();
      expect(insights.mostConsistentPlatform).toBeDefined();
      expect(insights.growthTrend).toBeDefined();
      expect(insights.seasonalPatterns).toBeDefined();
      expect(insights.seasonalPatterns.length).toBeGreaterThan(0);
    });

    it('should handle edge cases in performance calculation', () => {
      // Test with zero metrics
      const zeroMetrics: CalculatedMetrics = {
        ...mockCalculatedMetrics,
        totalAdsSpent: 0,
        totalCom: 0,
        totalOrdersSP: 0,
        totalOrdersLZD: 0,
        totalLinkClicks: 0
      };

      const result = aiDataAggregator.aggregatePerformanceMetrics(
        zeroMetrics,
        []
      );

      expect(result.aggregatedMetrics.costPerOrder).toBe(0);
      expect(result.aggregatedMetrics.revenuePerOrder).toBe(0);
      expect(result.aggregatedMetrics.conversionRate).toBe(0);
      expect(result.performanceInsights.growthTrend).toBe('stable');
    });

    it('should identify best and worst performing days', () => {
      const result = aiDataAggregator.aggregatePerformanceMetrics(
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const metrics = result.aggregatedMetrics;
      expect(metrics.bestPerformingDays).toBeDefined();
      expect(metrics.worstPerformingDays).toBeDefined();
      expect(metrics.bestPerformingDays.length).toBeGreaterThan(0);
      expect(metrics.worstPerformingDays.length).toBeGreaterThan(0);

      // Best performing day should have higher ROI than worst
      const bestDay = mockDailyMetrics.find(d => d.date === metrics.bestPerformingDays[0]);
      const worstDay = mockDailyMetrics.find(d => d.date === metrics.worstPerformingDays[0]);
      
      if (bestDay && worstDay) {
        expect(bestDay.roi).toBeGreaterThanOrEqual(worstDay.roi);
      }
    });

    it('should assess data quality accurately', () => {
      const result = aiDataAggregator.aggregatePerformanceMetrics(
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const dataQuality = result.aggregatedMetrics.dataQuality;
      
      // With good mock data, all scores should be reasonable
      expect(dataQuality.completeness).toBeGreaterThan(50);
      expect(dataQuality.consistency).toBeGreaterThan(0);
      expect(dataQuality.freshness).toBeGreaterThan(50); // Recent data
      expect(dataQuality.reliability).toBeGreaterThan(50);
    });
  });

  describe('aggregateFromImportedData', () => {
    it('should process data from useImportedData hook format', async () => {
      const importedDataResult = {
        importedData: {
          shopeeOrders: mockShopeeOrders,
          lazadaOrders: mockLazadaOrders,
          facebookAds: mockFacebookAds
        },
        calculatedMetrics: mockCalculatedMetrics,
        dailyMetrics: mockDailyMetrics,
        subIdAnalysis: [
          { id: 'campaign_001', orders: 2, commission: 350.75, adSpent: 250, roi: 40.3, platform: 'Mixed' },
          { id: 'campaign_002', orders: 2, commission: 305.5, adSpent: 180, roi: 69.7, platform: 'Mixed' }
        ],
        platformAnalysis: [
          { platform: 'Shopee', orders: 3, commission: 440, adSpend: 250, roi: 76 },
          { platform: 'Lazada', orders: 2, commission: 216.25, adSpend: 180, roi: 20.1 }
        ]
      };

      const result = await aiDataAggregator.aggregateFromImportedData(importedDataResult);

      expect(result).toBeDefined();
      expect(result.aiData.subIdAnalysis).toBeDefined();
      expect(result.aiData.platformAnalysis).toBeDefined();
      expect(result.aiData.subIdAnalysis.length).toBe(2);
      expect(result.aiData.platformAnalysis.length).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing imported data gracefully', async () => {
      const importedDataResult = {
        importedData: null,
        calculatedMetrics: mockCalculatedMetrics,
        dailyMetrics: mockDailyMetrics,
        subIdAnalysis: [],
        platformAnalysis: []
      };

      await expect(aiDataAggregator.aggregateFromImportedData(importedDataResult))
        .rejects.toThrow('No imported data available for AI analysis');
    });
  });

  describe('validateDashboardCompatibility', () => {
    it('should validate compatibility with existing Dashboard components', async () => {
      const result = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const compatibility = aiDataAggregator.validateDashboardCompatibility(
        result.aiData,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(compatibility).toBeDefined();
      expect(compatibility.isCompatible).toBeDefined();
      expect(compatibility.issues).toBeDefined();
      expect(compatibility.recommendations).toBeDefined();
      expect(Array.isArray(compatibility.issues)).toBe(true);
      expect(Array.isArray(compatibility.recommendations)).toBe(true);
    });

    it('should detect metric mismatches', () => {
      const mockAiData = {
        calculatedMetrics: { ...mockCalculatedMetrics, totalCom: 999999 }, // Intentional mismatch
        dailyMetrics: mockDailyMetrics,
        shopeeOrders: mockShopeeOrders,
        lazadaOrders: mockLazadaOrders,
        facebookAds: mockFacebookAds,
        subIds: ['campaign_001', 'campaign_002'],
        platforms: ['Shopee', 'Lazada', 'Facebook'],
        dateRange: { from: new Date('2025-08-20'), to: new Date('2025-08-22') }
      } as any;

      const compatibility = aiDataAggregator.validateDashboardCompatibility(
        mockAiData,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(compatibility.isCompatible).toBe(false);
      expect(compatibility.issues.length).toBeGreaterThan(0);
      expect(compatibility.issues.some(issue => issue.includes('commission mismatch'))).toBe(true);
    });
  });

  describe('generateIntegrationReport', () => {
    it('should generate comprehensive integration report', async () => {
      const aggregationResult = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const report = aiDataAggregator.generateIntegrationReport(
        aggregationResult,
        {
          calculatedMetrics: mockCalculatedMetrics,
          dailyMetrics: mockDailyMetrics
        }
      );

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.dataFlow).toBeDefined();
      expect(report.qualityMetrics).toBeDefined();
      expect(report.performance).toBeDefined();
      expect(report.compatibility).toBeDefined();

      // Check data flow metrics
      expect(report.dataFlow.inputRecords).toBe(7); // 3 + 2 + 2
      expect(report.dataFlow.processedRecords).toBe(7);
      expect(report.dataFlow.transformedRecords).toBe(7);
      expect(report.dataFlow.outputRecords).toBe(7);

      // Check quality metrics
      expect(report.qualityMetrics.dataQualityScore).toBeGreaterThan(0);
      expect(report.qualityMetrics.completeness).toBeGreaterThan(0);
      expect(report.qualityMetrics.consistency).toBeGreaterThan(0);
      expect(report.qualityMetrics.accuracy).toBeGreaterThan(0);

      // Check performance metrics
      expect(report.performance.processingTime).toBeGreaterThanOrEqual(0);
      expect(report.performance.recordsPerSecond).toBeGreaterThan(0);
    });
  });

  describe('integration with existing Dashboard components', () => {
    it('should produce data compatible with existing Dashboard metrics', async () => {
      const result = await aiDataAggregator.aggregateDataForAI(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      // The aggregated data should maintain compatibility with existing structures
      expect(result.aiData.calculatedMetrics.totalCom).toBe(mockCalculatedMetrics.totalCom);
      expect(result.aiData.calculatedMetrics.roi).toBe(mockCalculatedMetrics.roi);
      expect(result.aiData.calculatedMetrics.totalOrdersSP).toBe(mockCalculatedMetrics.totalOrdersSP);
      expect(result.aiData.calculatedMetrics.totalOrdersLZD).toBe(mockCalculatedMetrics.totalOrdersLZD);

      // Daily metrics should be preserved
      expect(result.aiData.dailyMetrics).toEqual(mockDailyMetrics);

      // Sub IDs should be extracted correctly
      expect(result.aiData.subIds).toContain('campaign_001');
      expect(result.aiData.subIds).toContain('campaign_002');

      // Platforms should be identified
      expect(result.aiData.platforms).toContain('Shopee');
      expect(result.aiData.platforms).toContain('Lazada');
      expect(result.aiData.platforms).toContain('Facebook');
    });

    it('should handle real-world data volume efficiently', async () => {
      // Create larger dataset to test performance
      const largeShopeeOrders = Array.from({ length: 100 }, (_, i) => ({
        'รหัสการสั่งซื้อ': `SP${String(i + 1).padStart(3, '0')}`,
        'คอมมิชชั่นสินค้าโดยรวม(฿)': (Math.random() * 200 + 50).toFixed(2),
        'มูลค่าซื้อ(฿)': (Math.random() * 1000 + 200).toFixed(2),
        'วันที่สั่งซื้อ': new Date(2025, 7, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
        'สถานะ': 'สำเร็จ',
        'Sub_id1': `campaign_${Math.floor(Math.random() * 10) + 1}`,
        sub_id: `campaign_${Math.floor(Math.random() * 10) + 1}`
      }));

      const startTime = Date.now();
      // Create larger datasets for all platforms
      const largeLazadaOrders = Array.from({ length: 50 }, (_, i) => ({
        'Check Out ID': `LZ${String(i + 1).padStart(3, '0')}`,
        'Payout': (Math.random() * 150 + 30).toFixed(2),
        'Order Amount': (Math.random() * 800 + 150).toFixed(2),
        'Order Time': new Date(2025, 7, Math.floor(Math.random() * 30) + 1).toISOString(),
        'Status': 'Fulfilled',
        'Validity': 'valid',
        'Sub ID': `campaign_${Math.floor(Math.random() * 10) + 1}`
      }));

      const largeFacebookAds = Array.from({ length: 30 }, (_, i) => ({
        'Campaign name': `Campaign ${i + 1}`,
        'Amount spent (THB)': (Math.random() * 300 + 50).toFixed(2),
        'Impressions': String(Math.floor(Math.random() * 20000) + 5000),
        'Link clicks': String(Math.floor(Math.random() * 1000) + 100),
        'Date': new Date(2025, 7, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
        'Sub ID': `campaign_${Math.floor(Math.random() * 10) + 1}`
      }));

      const result = await aiDataAggregator.aggregateDataForAI(
        largeShopeeOrders,
        largeLazadaOrders,
        largeFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );
      const processingTime = Date.now() - startTime;

      expect(result.aggregationStats.totalRecordsProcessed).toBe(180); // 100 + 50 + 30
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.errors).toHaveLength(0);
    });
  });
});