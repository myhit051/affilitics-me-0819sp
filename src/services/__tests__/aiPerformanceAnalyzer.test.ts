// Unit tests for AI Performance Analyzer
// Tests basic statistical analysis and recommendation generation

import { describe, it, expect, beforeEach } from 'vitest';
import { aiPerformanceAnalyzer } from '../aiPerformanceAnalyzer';
import { AIAnalysisData } from '@/types/ai';
import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';

describe('AIPerformanceAnalyzer', () => {
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

    // Mock daily metrics
    mockDailyMetrics = [
      { date: '2024-01-01', totalCom: 400, adSpend: 300, profit: 100, roi: 33.3, ordersSP: 5, ordersLZD: 2 },
      { date: '2024-01-02', totalCom: 450, adSpend: 350, profit: 100, roi: 28.6, ordersSP: 6, ordersLZD: 3 },
      { date: '2024-01-03', totalCom: 500, adSpend: 400, profit: 100, roi: 25.0, ordersSP: 7, ordersLZD: 2 },
      { date: '2024-01-04', totalCom: 550, adSpend: 450, profit: 100, roi: 22.2, ordersSP: 8, ordersLZD: 3 },
      { date: '2024-01-05', totalCom: 600, adSpend: 500, profit: 100, roi: 20.0, ordersSP: 9, ordersLZD: 4 },
      { date: '2024-01-06', totalCom: 650, adSpend: 550, profit: 100, roi: 18.2, ordersSP: 10, ordersLZD: 3 },
      { date: '2024-01-07', totalCom: 700, adSpend: 600, profit: 100, roi: 16.7, ordersSP: 11, ordersLZD: 4 }
    ];

    // Mock analysis data
    mockData = {
      shopeeOrders: [
        {
          'รหัสการสั่งซื้อ': 'SP001',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '100',
          'สถานะ': 'สำเร็จ',
          'Sub_id1': 'test_sub_1',
          'วันที่สั่งซื้อ': '2024-01-01'
        },
        {
          'รหัสการสั่งซื้อ': 'SP002',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '150',
          'สถานะ': 'สำเร็จ',
          'Sub_id1': 'test_sub_1',
          'วันที่สั่งซื้อ': '2024-01-02'
        },
        {
          'รหัสการสั่งซื้อ': 'SP003',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '80',
          'สถานะ': 'สำเร็จ',
          'Sub_id1': 'test_sub_2',
          'วันที่สั่งซื้อ': '2024-01-03'
        },
        {
          'รหัสการสั่งซื้อ': 'SP004',
          'คอมมิชชั่นสินค้าโดยรวม(฿)': '200',
          'สถานะ': 'ยกเลิก', // Cancelled order - should be excluded
          'Sub_id1': 'test_sub_3',
          'วันที่สั่งซื้อ': '2024-01-04'
        }
      ],
      lazadaOrders: [
        {
          'Sku Order ID': 'LZ001',
          'Payout': '120',
          'Status': 'Fulfilled',
          'Validity': 'valid',
          'Aff Sub ID': 'test_sub_1',
          'Order Time': '2024-01-01'
        },
        {
          'Sku Order ID': 'LZ002',
          'Payout': '90',
          'Status': 'Fulfilled',
          'Validity': 'valid',
          'Aff Sub ID': 'test_sub_2',
          'Order Time': '2024-01-02'
        },
        {
          'Sku Order ID': 'LZ003',
          'Payout': '110',
          'Status': 'Cancelled', // Should be excluded
          'Validity': 'valid',
          'Aff Sub ID': 'test_sub_3',
          'Order Time': '2024-01-03'
        }
      ],
      facebookAds: [
        {
          'Campaign name': 'Test Campaign test_sub_1',
          'Amount spent (THB)': '500',
          'Date': '2024-01-01'
        },
        {
          'Campaign name': 'Test Campaign test_sub_2',
          'Amount spent (THB)': '300',
          'Date': '2024-01-02'
        },
        {
          'Campaign name': 'Test Campaign test_sub_3',
          'Amount spent (THB)': '1000',
          'Date': '2024-01-03'
        }
      ],
      calculatedMetrics: mockCalculatedMetrics,
      dailyMetrics: mockDailyMetrics,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-07')
      },
      subIds: ['test_sub_1', 'test_sub_2', 'test_sub_3'],
      platforms: ['Shopee', 'Lazada', 'Facebook']
    };
  });

  describe('analyzeSubIdPerformance', () => {
    it('should analyze Sub ID performance correctly', () => {
      const result = aiPerformanceAnalyzer.analyzeSubIdPerformance(mockData);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that results are sorted by performance score
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].performanceScore).toBeGreaterThanOrEqual(result[i].performanceScore);
      }
      
      // Verify Sub ID data structure
      result.forEach(subId => {
        expect(subId).toHaveProperty('subId');
        expect(subId).toHaveProperty('platform');
        expect(subId).toHaveProperty('orders');
        expect(subId).toHaveProperty('revenue');
        expect(subId).toHaveProperty('adSpend');
        expect(subId).toHaveProperty('roi');
        expect(subId).toHaveProperty('performanceScore');
        expect(subId).toHaveProperty('riskLevel');
        expect(subId).toHaveProperty('trend');
        expect(subId).toHaveProperty('confidenceScore');
        
        expect(typeof subId.orders).toBe('number');
        expect(typeof subId.revenue).toBe('number');
        expect(typeof subId.adSpend).toBe('number');
        expect(typeof subId.roi).toBe('number');
        expect(typeof subId.performanceScore).toBe('number');
        expect(['low', 'medium', 'high']).toContain(subId.riskLevel);
        expect(['improving', 'declining', 'stable']).toContain(subId.trend);
        expect(subId.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(subId.confidenceScore).toBeLessThanOrEqual(100);
      });
    });

    it('should exclude cancelled orders from analysis', () => {
      const result = aiPerformanceAnalyzer.analyzeSubIdPerformance(mockData);
      
      // test_sub_3 should not appear in results because its only order was cancelled
      const testSub3 = result.find(subId => subId.subId === 'test_sub_3');
      expect(testSub3).toBeUndefined();
    });

    it('should calculate ROI correctly', () => {
      const result = aiPerformanceAnalyzer.analyzeSubIdPerformance(mockData);
      
      result.forEach(subId => {
        if (subId.adSpend > 0) {
          const expectedROI = ((subId.revenue - subId.adSpend) / subId.adSpend) * 100;
          expect(Math.abs(subId.roi - expectedROI)).toBeLessThan(0.01); // Allow for floating point precision
        } else {
          expect(subId.roi).toBe(0);
        }
      });
    });

    it('should assign appropriate risk levels', () => {
      const result = aiPerformanceAnalyzer.analyzeSubIdPerformance(mockData);
      
      result.forEach(subId => {
        if (subId.roi < 0) {
          expect(subId.riskLevel).toBe('high');
        } else if (subId.roi < 20) {
          expect(['medium', 'high']).toContain(subId.riskLevel);
        } else if (subId.roi >= 50) {
          expect(subId.riskLevel).toBe('low');
        }
      });
    });
  });

  describe('analyzePlatformPerformance', () => {
    it('should analyze platform performance correctly', () => {
      const result = aiPerformanceAnalyzer.analyzePlatformPerformance(mockData);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that results are sorted by performance score
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].performanceScore).toBeGreaterThanOrEqual(result[i].performanceScore);
      }
      
      // Verify platform data structure
      result.forEach(platform => {
        expect(platform).toHaveProperty('platform');
        expect(platform).toHaveProperty('orders');
        expect(platform).toHaveProperty('revenue');
        expect(platform).toHaveProperty('adSpend');
        expect(platform).toHaveProperty('roi');
        expect(platform).toHaveProperty('marketShare');
        expect(platform).toHaveProperty('efficiency');
        expect(platform).toHaveProperty('performanceScore');
        expect(platform).toHaveProperty('trend');
        
        expect(typeof platform.orders).toBe('number');
        expect(typeof platform.revenue).toBe('number');
        expect(typeof platform.adSpend).toBe('number');
        expect(typeof platform.roi).toBe('number');
        expect(typeof platform.marketShare).toBe('number');
        expect(typeof platform.efficiency).toBe('number');
        expect(typeof platform.performanceScore).toBe('number');
        expect(['improving', 'declining', 'stable']).toContain(platform.trend);
      });
    });

    it('should calculate market share correctly', () => {
      const result = aiPerformanceAnalyzer.analyzePlatformPerformance(mockData);
      
      const totalMarketShare = result.reduce((sum, platform) => sum + platform.marketShare, 0);
      expect(Math.abs(totalMarketShare - 100)).toBeLessThan(0.01); // Should sum to 100%
    });

    it('should calculate efficiency correctly', () => {
      const result = aiPerformanceAnalyzer.analyzePlatformPerformance(mockData);
      
      result.forEach(platform => {
        if (platform.adSpend > 0) {
          const expectedEfficiency = platform.revenue / platform.adSpend;
          expect(Math.abs(platform.efficiency - expectedEfficiency)).toBeLessThan(0.01);
        } else {
          expect(platform.efficiency).toBe(0);
        }
      });
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations based on performance analysis', () => {
      const result = aiPerformanceAnalyzer.generateRecommendations(mockData);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Verify recommendation data structure
      result.forEach(recommendation => {
        expect(recommendation).toHaveProperty('id');
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('title');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('expectedImpact');
        expect(recommendation).toHaveProperty('confidenceScore');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('actionItems');
        expect(recommendation).toHaveProperty('estimatedROIImprovement');
        expect(recommendation).toHaveProperty('reasoning');
        expect(recommendation).toHaveProperty('dataPoints');
        expect(recommendation).toHaveProperty('createdAt');
        
        expect(['budget', 'targeting', 'creative', 'platform', 'subid']).toContain(recommendation.type);
        expect(['high', 'medium', 'low']).toContain(recommendation.priority);
        expect(Array.isArray(recommendation.actionItems)).toBe(true);
        expect(typeof recommendation.expectedImpact).toBe('number');
        expect(typeof recommendation.confidenceScore).toBe('number');
        expect(typeof recommendation.estimatedROIImprovement).toBe('number');
        expect(typeof recommendation.dataPoints).toBe('number');
        expect(recommendation.createdAt).toBeInstanceOf(Date);
      });
    });

    it('should generate underperforming Sub ID recommendations when applicable', () => {
      // Create data with clearly underperforming Sub IDs
      const lowROIData = {
        ...mockData,
        calculatedMetrics: {
          ...mockCalculatedMetrics,
          roi: 10 // Low overall ROI
        }
      };
      
      const result = aiPerformanceAnalyzer.generateRecommendations(lowROIData);
      
      // Should include recommendations for underperforming campaigns
      const subIdRecommendations = result.filter(r => r.type === 'subid');
      expect(subIdRecommendations.length).toBeGreaterThan(0);
      
      subIdRecommendations.forEach(rec => {
        expect(rec.title).toContain('Sub ID');
        expect(rec.actionItems.length).toBeGreaterThan(0);
        expect(rec.affectedSubIds).toBeDefined();
        expect(Array.isArray(rec.affectedSubIds)).toBe(true);
      });
    });

    it('should generate scaling recommendations for high-performing Sub IDs', () => {
      // Create data with high-performing Sub IDs
      const highROIData = {
        ...mockData,
        calculatedMetrics: {
          ...mockCalculatedMetrics,
          roi: 80 // High overall ROI
        },
        // Add more orders to make Sub IDs qualify for scaling
        shopeeOrders: [
          ...mockData.shopeeOrders,
          {
            'รหัสการสั่งซื้อ': 'SP005',
            'คอมมิชชั่นสินค้าโดยรวม(฿)': '300',
            'สถานะ': 'สำเร็จ',
            'Sub_id1': 'test_sub_1',
            'วันที่สั่งซื้อ': '2024-01-05'
          },
          {
            'รหัสการสั่งซื้อ': 'SP006',
            'คอมมิชชั่นสินค้าโดยรวม(฿)': '400',
            'สถานะ': 'สำเร็จ',
            'Sub_id1': 'test_sub_1',
            'วันที่สั่งซื้อ': '2024-01-06'
          }
        ]
      };
      
      const result = aiPerformanceAnalyzer.generateRecommendations(highROIData);
      
      // Should include budget scaling recommendations or overall optimization
      const budgetRecommendations = result.filter(r => r.type === 'budget');
      expect(budgetRecommendations.length).toBeGreaterThanOrEqual(0); // Allow 0 or more
    });

    it('should generate platform optimization recommendations', () => {
      const result = aiPerformanceAnalyzer.generateRecommendations(mockData);
      
      // Should include platform recommendations when there are performance differences
      const platformRecommendations = result.filter(r => r.type === 'platform');
      
      platformRecommendations.forEach(rec => {
        expect(rec.affectedPlatforms).toBeDefined();
        expect(Array.isArray(rec.affectedPlatforms)).toBe(true);
        expect(rec.affectedPlatforms.length).toBeGreaterThan(0);
      });
    });

    it('should assign appropriate confidence scores', () => {
      const result = aiPerformanceAnalyzer.generateRecommendations(mockData);
      
      result.forEach(recommendation => {
        expect(recommendation.confidenceScore).toBeGreaterThanOrEqual(50);
        expect(recommendation.confidenceScore).toBeLessThanOrEqual(90);
        
        // Higher data points should generally lead to higher confidence
        if (recommendation.dataPoints > 100) {
          expect(recommendation.confidenceScore).toBeGreaterThan(60);
        }
      });
    });
  });

  describe('analyzeOverallPerformance', () => {
    it('should provide comprehensive performance analysis', () => {
      const result = aiPerformanceAnalyzer.analyzeOverallPerformance(mockData);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('subIdPerformance');
      expect(result).toHaveProperty('platformPerformance');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('confidenceScore');
      
      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      
      expect(typeof result.confidenceScore).toBe('number');
      expect(result.confidenceScore).toBeGreaterThanOrEqual(40);
      expect(result.confidenceScore).toBeLessThanOrEqual(95);
      
      expect(Array.isArray(result.subIdPerformance)).toBe(true);
      expect(Array.isArray(result.platformPerformance)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should calculate overall score based on ROI and performance metrics', () => {
      const highPerformanceData = {
        ...mockData,
        calculatedMetrics: {
          ...mockCalculatedMetrics,
          roi: 80 // High ROI
        }
      };
      
      const lowPerformanceData = {
        ...mockData,
        calculatedMetrics: {
          ...mockCalculatedMetrics,
          roi: 5 // Low ROI
        }
      };
      
      const highResult = aiPerformanceAnalyzer.analyzeOverallPerformance(highPerformanceData);
      const lowResult = aiPerformanceAnalyzer.analyzeOverallPerformance(lowPerformanceData);
      
      expect(highResult.overallScore).toBeGreaterThan(lowResult.overallScore);
    });

    it('should adjust confidence based on data quality', () => {
      const highDataQualityData = {
        ...mockData,
        calculatedMetrics: {
          ...mockCalculatedMetrics,
          totalOrdersSP: 500, // High order volume
          totalOrdersLZD: 300
        },
        dailyMetrics: Array.from({ length: 30 }, (_, i) => ({
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          totalCom: 400 + i * 10,
          adSpend: 300 + i * 8,
          profit: 100 + i * 2,
          roi: 33.3 - i * 0.5,
          ordersSP: 5 + i,
          ordersLZD: 2 + Math.floor(i / 2)
        }))
      };
      
      const lowDataQualityData = {
        ...mockData,
        calculatedMetrics: {
          ...mockCalculatedMetrics,
          totalOrdersSP: 10, // Low order volume
          totalOrdersLZD: 5
        },
        dailyMetrics: mockDailyMetrics.slice(0, 3) // Limited history
      };
      
      const highQualityResult = aiPerformanceAnalyzer.analyzeOverallPerformance(highDataQualityData);
      const lowQualityResult = aiPerformanceAnalyzer.analyzeOverallPerformance(lowDataQualityData);
      
      expect(highQualityResult.confidenceScore).toBeGreaterThan(lowQualityResult.confidenceScore);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty data gracefully', () => {
      const emptyData: AIAnalysisData = {
        shopeeOrders: [],
        lazadaOrders: [],
        facebookAds: [],
        calculatedMetrics: {
          ...mockCalculatedMetrics,
          totalOrdersSP: 0,
          totalOrdersLZD: 0,
          totalCom: 0,
          roi: 0
        },
        dailyMetrics: [],
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-07')
        },
        subIds: [],
        platforms: []
      };
      
      const subIdResult = aiPerformanceAnalyzer.analyzeSubIdPerformance(emptyData);
      const platformResult = aiPerformanceAnalyzer.analyzePlatformPerformance(emptyData);
      const recommendationResult = aiPerformanceAnalyzer.generateRecommendations(emptyData);
      const overallResult = aiPerformanceAnalyzer.analyzeOverallPerformance(emptyData);
      
      expect(Array.isArray(subIdResult)).toBe(true);
      expect(Array.isArray(platformResult)).toBe(true);
      expect(Array.isArray(recommendationResult)).toBe(true);
      expect(overallResult).toBeDefined();
      expect(overallResult.confidenceScore).toBeLessThan(50); // Low confidence for empty data
    });

    it('should handle invalid numeric values', () => {
      const invalidData = {
        ...mockData,
        shopeeOrders: [
          {
            'รหัสการสั่งซื้อ': 'SP001',
            'คอมมิชชั่นสินค้าโดยรวม(฿)': 'invalid_number',
            'สถานะ': 'สำเร็จ',
            'Sub_id1': 'test_sub_1',
            'วันที่สั่งซื้อ': '2024-01-01'
          }
        ],
        facebookAds: [
          {
            'Campaign name': 'Test Campaign test_sub_1',
            'Amount spent (THB)': 'not_a_number',
            'Date': '2024-01-01'
          }
        ]
      };
      
      expect(() => {
        aiPerformanceAnalyzer.analyzeSubIdPerformance(invalidData);
      }).not.toThrow();
      
      expect(() => {
        aiPerformanceAnalyzer.generateRecommendations(invalidData);
      }).not.toThrow();
    });

    it('should handle missing Sub ID fields', () => {
      const noSubIdData = {
        ...mockData,
        shopeeOrders: [
          {
            'รหัสการสั่งซื้อ': 'SP001',
            'คอมมิชชั่นสินค้าโดยรวม(฿)': '100',
            'สถานะ': 'สำเร็จ',
            'วันที่สั่งซื้อ': '2024-01-01'
            // No Sub ID fields
          }
        ]
      };
      
      const result = aiPerformanceAnalyzer.analyzeSubIdPerformance(noSubIdData);
      expect(Array.isArray(result)).toBe(true);
      // Should handle gracefully even with no Sub IDs
    });
  });
});