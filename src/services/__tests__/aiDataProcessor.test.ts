// Unit tests for AI Data Processor Service

import { describe, it, expect, beforeEach } from 'vitest';
import { aiDataProcessor } from '../aiDataProcessor';
import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';

describe('AIDataProcessor', () => {
  let mockShopeeOrders: any[];
  let mockLazadaOrders: any[];
  let mockFacebookAds: any[];
  let mockCalculatedMetrics: CalculatedMetrics;
  let mockDailyMetrics: DailyMetrics[];

  beforeEach(() => {
    mockShopeeOrders = [
      {
        'รหัสการสั่งซื้อ': 'SP001',
        'คอมมิชชั่นสินค้าโดยรวม(฿)': '100.50',
        'มูลค่าซื้อ(฿)': '500.00',
        'วันที่สั่งซื้อ': '2024-01-01',
        'เวลาที่สั่งซื้อ': '2024-01-01 10:30:00',
        'Sub_id1': 'test1',
        'Sub_id2': 'test2',
        sub_id: 'test1'
      },
      {
        'รหัสการสั่งซื้อ': 'SP002',
        'คอมมิชชั่นสินค้าโดยรวม(฿)': '75.25',
        'มูลค่าซื้อ(฿)': '300.00',
        'วันที่สั่งซื้อ': '2024-01-02',
        'Sub_id1': 'test3',
        sub_id: 'test3'
      }
    ];

    mockLazadaOrders = [
      {
        'Check Out ID': 'LZ001',
        'Payout': '80.00',
        'Order Amount': '400.00',
        'Order Time': '2024-01-01 14:20:00',
        'Aff Sub ID': 'test1',
        'Sub ID 1': 'test2',
        'Sub ID': 'test1'
      },
      {
        'Check Out ID': 'LZ002',
        'Payout': '120.75',
        'Order Amount': '600.00',
        'Order Time': '2024-01-02 16:45:00',
        'Sub ID': 'test4'
      }
    ];

    mockFacebookAds = [
      {
        'Campaign name': 'Test Campaign Sub ID test1',
        'Ad set name': 'Test Ad Set',
        'Ad name': 'Test Ad',
        'Amount spent (THB)': '150.00',
        'Impressions': '10000',
        'Link clicks': '500',
        'Reach': '8000',
        'Date': '2024-01-01',
        'Sub ID': 'test1'
      },
      {
        'Campaign name': 'Another Campaign',
        'Amount spent (THB)': '200.50',
        'Impressions': '15000',
        'Link clicks': '750',
        'Date': '2024-01-02',
        'Sub ID': 'test2'
      }
    ];

    mockCalculatedMetrics = {
      totalAdsSpent: 350.50,
      totalComSP: 175.75,
      totalComLZD: 200.75,
      totalCom: 376.50,
      totalOrdersSP: 2,
      totalOrdersLZD: 2,
      totalAmountSP: 800.00,
      totalAmountLZD: 1000.00,
      profit: 26.00,
      roi: 7.42,
      cpoSP: 175.25,
      cpoLZD: 175.25,
      cpcLink: 0.28,
      apcLZD: 2.85,
      validOrdersLZD: 2,
      invalidOrdersLZD: 0,
      totalLinkClicks: 1250,
      totalReach: 23000,
      totalRevenue: 376.50,
      totalProfit: 26.00,
      revenueChange: 0,
      profitChange: 0,
      roiChange: 0,
      ordersChange: 0,
      unitsLZD: 2
    };

    mockDailyMetrics = [
      { date: '2024-01-01', totalCom: 180.50, adSpend: 150.00, profit: 30.50, roi: 20.33, ordersSP: 1, ordersLZD: 1 },
      { date: '2024-01-02', totalCom: 196.00, adSpend: 200.50, profit: -4.50, roi: -2.24, ordersSP: 1, ordersLZD: 1 }
    ];
  });

  describe('processRawData', () => {
    it('should process raw data and return AIAnalysisData', () => {
      const result = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result).toBeDefined();
      expect(result.shopeeOrders).toBeDefined();
      expect(result.lazadaOrders).toBeDefined();
      expect(result.facebookAds).toBeDefined();
      expect(result.calculatedMetrics).toBe(mockCalculatedMetrics);
      expect(result.dailyMetrics).toBe(mockDailyMetrics);
      expect(result.dateRange).toBeDefined();
      expect(result.subIds).toBeDefined();
      expect(result.platforms).toBeDefined();
    });

    it('should extract unique Sub IDs from all sources', () => {
      const result = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.subIds).toContain('test1');
      expect(result.subIds).toContain('test2');
      expect(result.subIds).toContain('test3');
      expect(result.subIds).toContain('test4');
      expect(result.subIds.length).toBeGreaterThan(0);
      
      // Should not contain duplicates
      const uniqueSubIds = [...new Set(result.subIds)];
      expect(result.subIds.length).toBe(uniqueSubIds.length);
    });

    it('should identify platforms correctly', () => {
      const result = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.platforms).toContain('Shopee');
      expect(result.platforms).toContain('Lazada');
      expect(result.platforms).toContain('Facebook');
      expect(result.platforms.length).toBe(3);
    });

    it('should calculate date range from data', () => {
      const result = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.dateRange.from).toBeDefined();
      expect(result.dateRange.to).toBeDefined();
      expect(result.dateRange.from).toBeInstanceOf(Date);
      expect(result.dateRange.to).toBeInstanceOf(Date);
      expect(result.dateRange.from.getTime()).toBeLessThanOrEqual(result.dateRange.to.getTime());
    });

    it('should clean and standardize order data', () => {
      const result = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      // Check Shopee orders
      const shopeeOrder = result.shopeeOrders[0];
      expect(shopeeOrder.commission).toBe(100.50);
      expect(shopeeOrder.orderValue).toBe(500.00);
      expect(shopeeOrder.platform).toBe('Shopee');
      expect(shopeeOrder.subIds).toContain('test1');
      expect(shopeeOrder.subIds).toContain('test2');

      // Check Lazada orders
      const lazadaOrder = result.lazadaOrders[0];
      expect(lazadaOrder.commission).toBe(80.00);
      expect(lazadaOrder.orderValue).toBe(400.00);
      expect(lazadaOrder.platform).toBe('Lazada');
      expect(lazadaOrder.subIds).toContain('test1');

      // Check Facebook ads
      const facebookAd = result.facebookAds[0];
      expect(facebookAd.spend).toBe(150.00);
      expect(facebookAd.impressions).toBe(10000);
      expect(facebookAd.clicks).toBe(500);
      expect(facebookAd.platform).toBe('Facebook');
      expect(facebookAd.subId).toBe('test1');
    });
  });

  describe('validateData', () => {
    it('should validate data successfully with sufficient records', () => {
      // Create more records to meet the minimum requirement
      const moreShopeeOrders = [...mockShopeeOrders];
      const moreLazadaOrders = [...mockLazadaOrders];
      const moreFacebookAds = [...mockFacebookAds];
      
      // Add more records to reach the minimum of 10
      for (let i = 3; i <= 6; i++) {
        moreShopeeOrders.push({
          'รหัสการสั่งซื้อ': `SP00${i}`,
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '50.00',
          'มูลค่าซื้อ(฿)': '250.00',
          'วันที่สั่งซื้อ': new Date().toISOString().split('T')[0], // Today's date
          sub_id: `test${i}`
        });
        
        moreFacebookAds.push({
          'Campaign name': `Campaign ${i}`,
          'Amount spent (THB)': '100.00',
          'Date': new Date().toISOString().split('T')[0], // Today's date
          'Sub ID': `test${i}`
        });
      }

      // Update daily metrics with recent dates
      const recentDailyMetrics = [
        { date: new Date().toISOString().split('T')[0], totalCom: 180.50, adSpend: 150.00, profit: 30.50, roi: 20.33, ordersSP: 1, ordersLZD: 1 },
        { date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0], totalCom: 196.00, adSpend: 200.50, profit: -4.50, roi: -2.24, ordersSP: 1, ordersLZD: 1 }
      ];

      const aiData = aiDataProcessor.processRawData(
        moreShopeeOrders,
        moreLazadaOrders,
        moreFacebookAds,
        mockCalculatedMetrics,
        recentDailyMetrics
      );

      const validation = aiDataProcessor.validateData(aiData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect insufficient data', () => {
      const aiData = aiDataProcessor.processRawData(
        [], // Empty Shopee orders
        [], // Empty Lazada orders
        [], // Empty Facebook ads
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const validation = aiDataProcessor.validateData(aiData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Insufficient data: At least 10 records required for AI analysis');
    });

    it('should detect missing calculated metrics', () => {
      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      // Remove calculated metrics
      aiData.calculatedMetrics = null as any;

      const validation = aiDataProcessor.validateData(aiData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing calculated metrics required for AI analysis');
    });

    it('should detect invalid date range', () => {
      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      // Set invalid date range
      aiData.dateRange = {
        from: new Date('2024-01-02'),
        to: new Date('2024-01-01') // End before start
      };

      const validation = aiDataProcessor.validateData(aiData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid date range: Start date must be before end date');
    });

    it('should warn about missing Sub IDs', () => {
      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      // Remove Sub IDs
      aiData.subIds = [];

      const validation = aiDataProcessor.validateData(aiData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('No Sub IDs found in data - this may limit AI analysis capabilities');
    });

    it('should detect invalid daily metrics', () => {
      const invalidDailyMetrics: DailyMetrics[] = [
        { date: '2024-01-01', totalCom: NaN, adSpend: 100, profit: 20, roi: 20, ordersSP: 1, ordersLZD: 1 },
        { date: '2024-01-02', totalCom: 150, adSpend: NaN, profit: 30, roi: 25, ordersSP: 1, ordersLZD: 1 }
      ];

      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        invalidDailyMetrics
      );

      const validation = aiDataProcessor.validateData(aiData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('daily metrics contain invalid numerical values'))).toBe(true);
    });
  });

  describe('enrichData', () => {
    it('should enrich data with enhanced metrics', () => {
      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const enrichedData = aiDataProcessor.enrichData(aiData);

      expect(enrichedData).toBeDefined();
      expect(enrichedData.calculatedMetrics).toBeDefined();
      
      // Check if enhanced metrics are added
      const enhancedMetrics = enrichedData.calculatedMetrics as any;
      expect(enhancedMetrics.roiTrend).toBeDefined();
      expect(enhancedMetrics.revenueTrend).toBeDefined();
      expect(enhancedMetrics.ordersTrend).toBeDefined();
      expect(enhancedMetrics.costPerOrder).toBeDefined();
      expect(enhancedMetrics.revenuePerOrder).toBeDefined();
      expect(enhancedMetrics.conversionRate).toBeDefined();
      expect(enhancedMetrics.platformPerformance).toBeDefined();
      expect(enhancedMetrics.topPerformingSubIds).toBeDefined();
      expect(enhancedMetrics.underPerformingSubIds).toBeDefined();
      expect(enhancedMetrics.dataQuality).toBeDefined();
    });

    it('should add performance indicators to records', () => {
      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const enrichedData = aiDataProcessor.enrichData(aiData);

      // Check Shopee orders have AI metrics
      const shopeeOrder = enrichedData.shopeeOrders[0];
      expect(shopeeOrder._aiMetrics).toBeDefined();
      expect(shopeeOrder._aiMetrics.platform).toBe('shopee');
      expect(shopeeOrder._aiMetrics.performanceScore).toBeGreaterThan(0);
      expect(shopeeOrder._aiMetrics.riskLevel).toBeDefined();
      expect(shopeeOrder._aiMetrics.optimizationPotential).toBeDefined();

      // Check Lazada orders have AI metrics
      const lazadaOrder = enrichedData.lazadaOrders[0];
      expect(lazadaOrder._aiMetrics).toBeDefined();
      expect(lazadaOrder._aiMetrics.platform).toBe('lazada');

      // Check Facebook ads have AI metrics
      const facebookAd = enrichedData.facebookAds[0];
      expect(facebookAd._aiMetrics).toBeDefined();
      expect(facebookAd._aiMetrics.platform).toBe('facebook');
    });

    it('should calculate platform performance correctly', () => {
      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const enrichedData = aiDataProcessor.enrichData(aiData);
      const enhancedMetrics = enrichedData.calculatedMetrics as any;

      expect(enhancedMetrics.platformPerformance.shopee).toBeDefined();
      expect(enhancedMetrics.platformPerformance.lazada).toBeDefined();
      expect(enhancedMetrics.platformPerformance.facebook).toBeDefined();

      expect(enhancedMetrics.platformPerformance.shopee.orders).toBe(mockCalculatedMetrics.totalOrdersSP);
      expect(enhancedMetrics.platformPerformance.lazada.orders).toBe(mockCalculatedMetrics.totalOrdersLZD);
    });

    it('should assess data quality', () => {
      const aiData = aiDataProcessor.processRawData(
        mockShopeeOrders,
        mockLazadaOrders,
        mockFacebookAds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const enrichedData = aiDataProcessor.enrichData(aiData);
      const enhancedMetrics = enrichedData.calculatedMetrics as any;

      expect(enhancedMetrics.dataQuality).toBeDefined();
      expect(enhancedMetrics.dataQuality.completeness).toBeGreaterThanOrEqual(0);
      expect(enhancedMetrics.dataQuality.completeness).toBeLessThanOrEqual(100);
      expect(enhancedMetrics.dataQuality.consistency).toBeGreaterThanOrEqual(0);
      expect(enhancedMetrics.dataQuality.consistency).toBeLessThanOrEqual(100);
      expect(enhancedMetrics.dataQuality.freshness).toBeGreaterThanOrEqual(0);
      expect(enhancedMetrics.dataQuality.freshness).toBeLessThanOrEqual(100);
      expect(enhancedMetrics.dataQuality.reliability).toBeGreaterThanOrEqual(0);
      expect(enhancedMetrics.dataQuality.reliability).toBeLessThanOrEqual(100);
    });
  });

  describe('edge cases', () => {
    it('should handle empty data gracefully', () => {
      const result = aiDataProcessor.processRawData(
        [],
        [],
        [],
        mockCalculatedMetrics,
        []
      );

      expect(result.subIds).toHaveLength(0);
      expect(result.platforms).toHaveLength(0);
      expect(result.dateRange.from).toBeInstanceOf(Date);
      expect(result.dateRange.to).toBeInstanceOf(Date);
    });

    it('should handle malformed data', () => {
      const malformedShopeeOrders = [
        {
          'รหัสการสั่งซื้อ': 'SP001',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': 'invalid_number',
          'มูลค่าซื้อ(฿)': null,
          'วันที่สั่งซื้อ': 'invalid_date'
        }
      ];

      const result = aiDataProcessor.processRawData(
        malformedShopeeOrders,
        [],
        [],
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      const cleanedOrder = result.shopeeOrders[0];
      expect(cleanedOrder.commission).toBe(0); // Should default to 0 for invalid numbers
      expect(cleanedOrder.orderValue).toBe(0);
      expect(cleanedOrder.orderDate).toBeNull(); // Should be null for invalid dates
    });

    it('should extract Sub IDs from Facebook campaign names', () => {
      const facebookAdsWithSubIds = [
        {
          'Campaign name': 'Summer Campaign sub_id_abc123',
          'Ad set name': 'Test Ad Set',
          'Amount spent (THB)': '100',
          'Date': '2024-01-01'
        },
        {
          'Campaign name': 'Winter Campaign SubID xyz789',
          'Amount spent (THB)': '150',
          'Date': '2024-01-02'
        }
      ];

      const result = aiDataProcessor.processRawData(
        [],
        [],
        facebookAdsWithSubIds,
        mockCalculatedMetrics,
        mockDailyMetrics
      );

      expect(result.subIds).toContain('abc123');
      expect(result.subIds).toContain('xyz789');
    });
  });
});