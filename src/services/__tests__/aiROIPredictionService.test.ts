// Unit tests for AI ROI Prediction Service

import { describe, it, expect, beforeEach } from 'vitest';
import { aiROIPredictionService } from '../aiROIPredictionService';
import { AIAnalysisData } from '@/types/ai';
import { DailyMetrics } from '@/utils/affiliateCalculations';

describe('AI ROI Prediction Service', () => {
  let mockAnalysisData: AIAnalysisData;
  let mockDailyMetrics: DailyMetrics[];

  beforeEach(() => {
    // Create mock daily metrics with realistic ROI progression
    mockDailyMetrics = [
      { date: '2024-01-01', totalCom: 1000, adSpend: 800, roi: 25, ordersSP: 5, ordersLZD: 3, totalComSP: 600, totalComLZD: 400 },
      { date: '2024-01-02', totalCom: 1200, adSpend: 900, roi: 33, ordersSP: 6, ordersLZD: 4, totalComSP: 720, totalComLZD: 480 },
      { date: '2024-01-03', totalCom: 1100, adSpend: 850, roi: 29, ordersSP: 5, ordersLZD: 4, totalComSP: 660, totalComLZD: 440 },
      { date: '2024-01-04', totalCom: 1300, adSpend: 950, roi: 37, ordersSP: 7, ordersLZD: 4, totalComSP: 780, totalComLZD: 520 },
      { date: '2024-01-05', totalCom: 1250, adSpend: 900, roi: 39, ordersSP: 6, ordersLZD: 5, totalComSP: 750, totalComLZD: 500 },
      { date: '2024-01-06', totalCom: 1400, adSpend: 1000, roi: 40, ordersSP: 8, ordersLZD: 4, totalComSP: 840, totalComLZD: 560 },
      { date: '2024-01-07', totalCom: 1350, adSpend: 950, roi: 42, ordersSP: 7, ordersLZD: 5, totalComSP: 810, totalComLZD: 540 },
      { date: '2024-01-08', totalCom: 1500, adSpend: 1100, roi: 36, ordersSP: 8, ordersLZD: 6, totalComSP: 900, totalComLZD: 600 },
      { date: '2024-01-09', totalCom: 1450, adSpend: 1050, roi: 38, ordersSP: 7, ordersLZD: 6, totalComSP: 870, totalComLZD: 580 },
      { date: '2024-01-10', totalCom: 1600, adSpend: 1200, roi: 33, ordersSP: 9, ordersLZD: 6, totalComSP: 960, totalComLZD: 640 },
      { date: '2024-01-11', totalCom: 1550, adSpend: 1150, roi: 35, ordersSP: 8, ordersLZD: 6, totalComSP: 930, totalComLZD: 620 },
      { date: '2024-01-12', totalCom: 1700, adSpend: 1300, roi: 31, ordersSP: 9, ordersLZD: 7, totalComSP: 1020, totalComLZD: 680 },
      { date: '2024-01-13', totalCom: 1650, adSpend: 1250, roi: 32, ordersSP: 8, ordersLZD: 7, totalComSP: 990, totalComLZD: 660 },
      { date: '2024-01-14', totalCom: 1800, adSpend: 1400, roi: 29, ordersSP: 10, ordersLZD: 7, totalComSP: 1080, totalComLZD: 720 }
    ];

    mockAnalysisData = {
      shopeeOrders: [],
      lazadaOrders: [],
      facebookAds: [],
      calculatedMetrics: {
        totalCom: 19350,
        totalComSP: 11610,
        totalComLZD: 7740,
        totalOrdersSP: 103,
        totalOrdersLZD: 72,
        totalAdsSpent: 14850,
        roi: 30.3,
        cpoSP: 144.17,
        cpoLZD: 206.25,
        totalLinkClicks: 2500,
        totalImpressions: 50000,
        totalReach: 35000,
        cpm: 297,
        cpc: 5.94,
        ctr: 5.0
      },
      dailyMetrics: mockDailyMetrics,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-14')
      },
      subIds: ['test1', 'test2'],
      platforms: ['Shopee', 'Lazada', 'Facebook']
    };
  });

  describe('predictROI', () => {
    it('should generate predictions for default timeframes', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);

      expect(result.predictions).toHaveLength(3); // 7, 14, 30 days
      expect(result.predictions[0].timeframe).toBe(7);
      expect(result.predictions[1].timeframe).toBe(14);
      expect(result.predictions[2].timeframe).toBe(30);
    });

    it('should generate predictions for custom timeframes', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData, [10, 20]);

      expect(result.predictions).toHaveLength(2);
      expect(result.predictions[0].timeframe).toBe(10);
      expect(result.predictions[1].timeframe).toBe(20);
    });

    it('should include confidence intervals for each prediction', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);

      result.predictions.forEach(prediction => {
        expect(prediction.confidenceInterval).toBeDefined();
        expect(prediction.confidenceInterval.lower).toBeTypeOf('number');
        expect(prediction.confidenceInterval.upper).toBeTypeOf('number');
        expect(prediction.confidenceInterval.lower).toBeLessThan(prediction.confidenceInterval.upper);
      });
    });

    it('should calculate confidence scores between 30-95', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);

      result.predictions.forEach(prediction => {
        expect(prediction.confidenceScore).toBeGreaterThanOrEqual(30);
        expect(prediction.confidenceScore).toBeLessThanOrEqual(95);
      });
    });

    it('should assess risk levels correctly', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);

      result.predictions.forEach(prediction => {
        expect(['low', 'medium', 'high']).toContain(prediction.riskLevel);
      });
    });

    it('should include prediction factors', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);

      result.predictions.forEach(prediction => {
        expect(prediction.factors).toBeDefined();
        expect(prediction.factors.length).toBeGreaterThan(0);
        
        prediction.factors.forEach(factor => {
          expect(factor.name).toBeTypeOf('string');
          expect(factor.impact).toBeTypeOf('number');
          expect(factor.description).toBeTypeOf('string');
          expect(factor.confidence).toBeTypeOf('number');
        });
      });
    });

    it('should provide data quality assessment', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);

      expect(result.dataQuality).toBeDefined();
      expect(result.dataQuality.sufficiency).toBeGreaterThanOrEqual(0);
      expect(result.dataQuality.sufficiency).toBeLessThanOrEqual(100);
      expect(result.dataQuality.consistency).toBeGreaterThanOrEqual(0);
      expect(result.dataQuality.consistency).toBeLessThanOrEqual(100);
      expect(['improving', 'declining', 'stable']).toContain(result.dataQuality.trend);
    });

    it('should generate relevant recommendations', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle improving trend correctly', async () => {
      // Create data with clear improving trend
      const improvingMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: 20 + (index * 2) // ROI increases by 2% each day
      }));

      const improvingData = {
        ...mockAnalysisData,
        dailyMetrics: improvingMetrics
      };

      const result = await aiROIPredictionService.predictROI(improvingData);

      expect(result.dataQuality.trend).toBe('improving');
      
      // Predictions should generally be higher than current average
      const currentAvgROI = improvingMetrics.reduce((sum, m) => sum + m.roi, 0) / improvingMetrics.length;
      const shortTermPrediction = result.predictions.find(p => p.timeframe === 7);
      
      expect(shortTermPrediction?.predictedValue).toBeGreaterThan(currentAvgROI * 0.9); // Allow some variance
    });

    it('should handle declining trend correctly', async () => {
      // Create data with clear declining trend
      const decliningMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: 50 - (index * 2) // ROI decreases by 2% each day
      }));

      const decliningData = {
        ...mockAnalysisData,
        dailyMetrics: decliningMetrics
      };

      const result = await aiROIPredictionService.predictROI(decliningData);

      expect(result.dataQuality.trend).toBe('declining');
      expect(result.riskAssessment).toBe('medium'); // Should be at least medium risk
    });

    it('should handle stable trend correctly', async () => {
      // Create data with stable trend (small variations around mean)
      const stableMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: 30 + (Math.sin(index) * 2) // Small oscillations around 30%
      }));

      const stableData = {
        ...mockAnalysisData,
        dailyMetrics: stableMetrics
      };

      const result = await aiROIPredictionService.predictROI(stableData);

      expect(result.dataQuality.trend).toBe('stable');
    });
  });

  describe('error handling', () => {
    it('should throw error for insufficient data', async () => {
      const insufficientData = {
        ...mockAnalysisData,
        dailyMetrics: mockDailyMetrics.slice(0, 3) // Only 3 days of data
      };

      await expect(aiROIPredictionService.predictROI(insufficientData))
        .rejects.toThrow('Insufficient data for prediction');
    });

    it('should throw error for no daily metrics', async () => {
      const noMetricsData = {
        ...mockAnalysisData,
        dailyMetrics: []
      };

      await expect(aiROIPredictionService.predictROI(noMetricsData))
        .rejects.toThrow('No daily metrics available for prediction');
    });

    it('should throw error for invalid ROI values', async () => {
      const invalidROIData = {
        ...mockAnalysisData,
        dailyMetrics: mockDailyMetrics.map(metric => ({
          ...metric,
          roi: NaN
        }))
      };

      await expect(aiROIPredictionService.predictROI(invalidROIData))
        .rejects.toThrow('Insufficient valid ROI data points');
    });
  });

  describe('prediction accuracy', () => {
    it('should generate reasonable predictions for stable data', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);
      const shortTermPrediction = result.predictions.find(p => p.timeframe === 7);

      // Prediction should be within reasonable range of historical average
      const avgROI = mockDailyMetrics.reduce((sum, m) => sum + m.roi, 0) / mockDailyMetrics.length;
      
      expect(shortTermPrediction?.predictedValue).toBeGreaterThan(avgROI * 0.5);
      expect(shortTermPrediction?.predictedValue).toBeLessThan(avgROI * 2);
    });

    it('should have wider confidence intervals for longer predictions', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);
      
      const shortTerm = result.predictions.find(p => p.timeframe === 7);
      const longTerm = result.predictions.find(p => p.timeframe === 30);

      if (shortTerm && longTerm) {
        const shortTermRange = shortTerm.confidenceInterval.upper - shortTerm.confidenceInterval.lower;
        const longTermRange = longTerm.confidenceInterval.upper - longTerm.confidenceInterval.lower;
        
        expect(longTermRange).toBeGreaterThan(shortTermRange);
      }
    });

    it('should have lower confidence for longer predictions', async () => {
      const result = await aiROIPredictionService.predictROI(mockAnalysisData);
      
      const shortTerm = result.predictions.find(p => p.timeframe === 7);
      const longTerm = result.predictions.find(p => p.timeframe === 30);

      if (shortTerm && longTerm) {
        expect(longTerm.confidenceScore).toBeLessThanOrEqual(shortTerm.confidenceScore);
      }
    });
  });

  describe('risk assessment', () => {
    it('should assess low risk for stable, consistent data', async () => {
      // Create very stable data
      const stableMetrics = Array.from({ length: 14 }, (_, index) => ({
        date: `2024-01-${String(index + 1).padStart(2, '0')}`,
        totalCom: 1000,
        adSpend: 800,
        roi: 25, // Constant ROI
        ordersSP: 5,
        ordersLZD: 3,
        totalComSP: 600,
        totalComLZD: 400
      }));

      const stableData = {
        ...mockAnalysisData,
        dailyMetrics: stableMetrics
      };

      const result = await aiROIPredictionService.predictROI(stableData);
      
      // Should have low risk due to stability
      expect(result.riskAssessment).toBe('low');
    });

    it('should assess high risk for volatile data', async () => {
      // Create highly volatile data
      const volatileMetrics = mockDailyMetrics.map((metric, index) => ({
        ...metric,
        roi: index % 2 === 0 ? 10 : 60 // Alternating between 10% and 60%
      }));

      const volatileData = {
        ...mockAnalysisData,
        dailyMetrics: volatileMetrics
      };

      const result = await aiROIPredictionService.predictROI(volatileData);
      
      // Should have high risk due to volatility
      expect(['medium', 'high']).toContain(result.riskAssessment);
    });
  });

  describe('confidence calculation', () => {
    it('should have higher confidence with more data points', async () => {
      // Test with minimal data
      const minimalData = {
        ...mockAnalysisData,
        dailyMetrics: mockDailyMetrics.slice(0, 7)
      };

      // Test with more data
      const extendedMetrics = [
        ...mockDailyMetrics,
        ...Array.from({ length: 16 }, (_, index) => ({
          date: `2024-01-${String(index + 15).padStart(2, '0')}`,
          totalCom: 1400 + (index * 50),
          adSpend: 1000 + (index * 30),
          roi: 35 + (index * 0.5),
          ordersSP: 7 + Math.floor(index / 2),
          ordersLZD: 5 + Math.floor(index / 3),
          totalComSP: 840 + (index * 30),
          totalComLZD: 560 + (index * 20)
        }))
      ];

      const extendedData = {
        ...mockAnalysisData,
        dailyMetrics: extendedMetrics
      };

      const minimalResult = await aiROIPredictionService.predictROI(minimalData);
      const extendedResult = await aiROIPredictionService.predictROI(extendedData);

      expect(extendedResult.confidence).toBeGreaterThanOrEqual(minimalResult.confidence);
    });
  });
});