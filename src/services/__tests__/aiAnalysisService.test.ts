// Unit tests for AI Analysis Service

import { describe, it, expect, beforeEach } from 'vitest';
import { aiAnalysisService } from '../aiAnalysisService';
import { AIAnalysisData } from '@/types/ai';
import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';

describe('AIAnalysisService', () => {
  let mockData: AIAnalysisData;

  beforeEach(() => {
    // Create mock data for testing
    const mockCalculatedMetrics: CalculatedMetrics = {
      totalAdsSpent: 1000,
      totalComSP: 800,
      totalComLZD: 600,
      totalCom: 1400,
      totalOrdersSP: 20,
      totalOrdersLZD: 15,
      totalAmountSP: 5000,
      totalAmountLZD: 4000,
      profit: 400,
      roi: 40,
      cpoSP: 50,
      cpoLZD: 66.67,
      cpcLink: 2.5,
      apcLZD: 4,
      validOrdersLZD: 15,
      invalidOrdersLZD: 0,
      totalLinkClicks: 400,
      totalReach: 10000,
      totalRevenue: 1400,
      totalProfit: 400,
      revenueChange: 0,
      profitChange: 0,
      roiChange: 0,
      ordersChange: 0,
      unitsLZD: 15
    };

    const mockDailyMetrics: DailyMetrics[] = [
      { date: '2024-01-01', totalCom: 100, adSpend: 80, profit: 20, roi: 25, ordersSP: 2, ordersLZD: 1 },
      { date: '2024-01-02', totalCom: 120, adSpend: 90, profit: 30, roi: 33.33, ordersSP: 3, ordersLZD: 2 },
      { date: '2024-01-03', totalCom: 110, adSpend: 85, profit: 25, roi: 29.41, ordersSP: 2, ordersLZD: 2 }
    ];

    mockData = {
      shopeeOrders: [
        { 'รหัสการสั่งซื้อ': '001', 'คอมมิชชั่นสินค้าโดยรวม(฿)': '100', sub_id: 'test1' },
        { 'รหัสการสั่งซื้อ': '002', 'คอมมิชชั่นสินค้าโดยรวม(฿)': '150', sub_id: 'test2' }
      ],
      lazadaOrders: [
        { 'Check Out ID': '001', 'Payout': '80', 'Sub ID': 'test1' },
        { 'Check Out ID': '002', 'Payout': '120', 'Sub ID': 'test2' }
      ],
      facebookAds: [
        { 'Campaign name': 'Test Campaign', 'Amount spent (THB)': '100', 'Sub ID': 'test1' },
        { 'Campaign name': 'Test Campaign 2', 'Amount spent (THB)': '150', 'Sub ID': 'test2' }
      ],
      calculatedMetrics: mockCalculatedMetrics,
      dailyMetrics: mockDailyMetrics,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-03')
      },
      subIds: ['test1', 'test2'],
      platforms: ['Shopee', 'Lazada', 'Facebook']
    };
  });

  describe('analyzePerformance', () => {
    it('should return complete analysis result', async () => {
      const result = await aiAnalysisService.analyzePerformance(mockData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.analysisType).toBe('performance');
      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
      expect(result.recommendations).toBeDefined();
      expect(result.predictions).toBeDefined();
      expect(result.alerts).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.confidence).toBeGreaterThan(0);
      expect(result.metadata.confidence).toBeLessThanOrEqual(100);
    });

    it('should include metadata with correct data points', async () => {
      const result = await aiAnalysisService.analyzePerformance(mockData);

      expect(result.metadata.dataPointsAnalyzed).toBe(6); // 2 + 2 + 2
      expect(result.metadata.analysisStartTime).toBeDefined();
      expect(result.metadata.analysisEndTime).toBeDefined();
      expect(result.metadata.modelVersion).toBe('1.0.0');
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for low ROI', async () => {
      // Modify data to have low ROI
      mockData.calculatedMetrics.roi = 15;
      mockData.calculatedMetrics.totalAdsSpent = 2000;

      const recommendations = await aiAnalysisService.generateRecommendations(mockData);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const budgetRec = recommendations.find(r => r.type === 'budget');
      expect(budgetRec).toBeDefined();
      expect(budgetRec?.title).toContain('Budget');
      expect(budgetRec?.priority).toBe('high');
      expect(budgetRec?.confidenceScore).toBeGreaterThan(0);
    });

    it('should generate platform recommendations for performance differences', async () => {
      const recommendations = await aiAnalysisService.generateRecommendations(mockData);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      
      recommendations.forEach(rec => {
        expect(rec.id).toBeDefined();
        expect(rec.type).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.confidenceScore).toBeGreaterThan(0);
        expect(rec.confidenceScore).toBeLessThanOrEqual(100);
        expect(rec.actionItems).toBeDefined();
        expect(Array.isArray(rec.actionItems)).toBe(true);
      });
    });

    it('should include action items in recommendations', async () => {
      const recommendations = await aiAnalysisService.generateRecommendations(mockData);

      if (recommendations.length > 0) {
        const firstRec = recommendations[0];
        expect(firstRec.actionItems).toBeDefined();
        expect(firstRec.actionItems.length).toBeGreaterThan(0);
        
        firstRec.actionItems.forEach(action => {
          expect(action.id).toBeDefined();
          expect(action.description).toBeDefined();
          expect(action.type).toBeDefined();
          expect(action.estimatedImpact).toBeDefined();
        });
      }
    });
  });

  describe('predictMetrics', () => {
    it('should generate ROI and revenue predictions', async () => {
      const predictions = await aiAnalysisService.predictMetrics(mockData, 30);

      expect(predictions).toBeDefined();
      expect(predictions.length).toBeGreaterThan(0);
      
      const roiPrediction = predictions.find(p => p.type === 'roi');
      const revenuePrediction = predictions.find(p => p.type === 'revenue');
      
      expect(roiPrediction).toBeDefined();
      expect(revenuePrediction).toBeDefined();
      
      expect(roiPrediction?.timeframe).toBe(30);
      expect(roiPrediction?.predictedValue).toBeGreaterThanOrEqual(0);
      expect(roiPrediction?.confidenceInterval).toBeDefined();
      expect(roiPrediction?.confidenceScore).toBeGreaterThan(0);
      expect(roiPrediction?.factors).toBeDefined();
      expect(roiPrediction?.factors.length).toBeGreaterThan(0);
    });

    it('should include prediction factors with confidence scores', async () => {
      const predictions = await aiAnalysisService.predictMetrics(mockData, 14);

      predictions.forEach(prediction => {
        expect(prediction.factors).toBeDefined();
        expect(prediction.factors.length).toBeGreaterThan(0);
        
        prediction.factors.forEach(factor => {
          expect(factor.name).toBeDefined();
          expect(factor.impact).toBeDefined();
          expect(factor.description).toBeDefined();
          expect(factor.confidence).toBeGreaterThan(0);
          expect(factor.confidence).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('detectAnomalies', () => {
    it('should detect low ROI alerts', async () => {
      // Set up data for low ROI alert
      mockData.calculatedMetrics.roi = 10;
      mockData.calculatedMetrics.totalAdsSpent = 1000;

      const alerts = await aiAnalysisService.detectAnomalies(mockData);

      expect(alerts).toBeDefined();
      expect(alerts.length).toBeGreaterThan(0);
      
      const lowRoiAlert = alerts.find(a => a.title.includes('ROI'));
      expect(lowRoiAlert).toBeDefined();
      expect(lowRoiAlert?.type).toBe('critical');
      expect(lowRoiAlert?.severity).toBe('high');
      expect(lowRoiAlert?.recommendations).toBeDefined();
      expect(lowRoiAlert?.recommendations.length).toBeGreaterThan(0);
    });

    it('should detect high spend alerts', async () => {
      // Set up data for high spend alert
      mockData.calculatedMetrics.totalAdsSpent = 3000;
      mockData.calculatedMetrics.totalCom = 1500;

      const alerts = await aiAnalysisService.detectAnomalies(mockData);

      const highSpendAlert = alerts.find(a => a.title.includes('Spend'));
      if (highSpendAlert) {
        expect(highSpendAlert.type).toBe('warning');
        expect(highSpendAlert.affectedMetric).toBe('Ad Spend');
        expect(highSpendAlert.currentValue).toBe(3000);
        expect(highSpendAlert.isRead).toBe(false);
        expect(highSpendAlert.isDismissed).toBe(false);
      }
    });

    it('should detect performance decline', async () => {
      // Create data with declining performance
      const decliningMetrics: DailyMetrics[] = [
        { date: '2024-01-01', totalCom: 100, adSpend: 80, profit: 20, roi: 50, ordersSP: 2, ordersLZD: 1 },
        { date: '2024-01-02', totalCom: 100, adSpend: 80, profit: 20, roi: 45, ordersSP: 2, ordersLZD: 1 },
        { date: '2024-01-03', totalCom: 100, adSpend: 80, profit: 20, roi: 40, ordersSP: 2, ordersLZD: 1 },
        { date: '2024-01-04', totalCom: 100, adSpend: 80, profit: 20, roi: 35, ordersSP: 2, ordersLZD: 1 },
        { date: '2024-01-05', totalCom: 100, adSpend: 80, profit: 20, roi: 30, ordersSP: 2, ordersLZD: 1 },
        { date: '2024-01-06', totalCom: 100, adSpend: 80, profit: 20, roi: 25, ordersSP: 2, ordersLZD: 1 },
        { date: '2024-01-07', totalCom: 100, adSpend: 80, profit: 20, roi: 20, ordersSP: 2, ordersLZD: 1 }
      ];

      mockData.dailyMetrics = decliningMetrics;

      const alerts = await aiAnalysisService.detectAnomalies(mockData);

      const declineAlert = alerts.find(a => a.title.includes('Decline'));
      if (declineAlert) {
        expect(declineAlert.type).toBe('warning');
        expect(declineAlert.affectedMetric).toBe('ROI Trend');
        expect(declineAlert.severity).toBe('medium');
      }
    });
  });

  describe('getInsights', () => {
    it('should generate platform performance insights', async () => {
      const insights = await aiAnalysisService.getInsights(mockData);

      expect(insights).toBeDefined();
      expect(insights.length).toBeGreaterThan(0);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.insight).toBeDefined();
        expect(insight.confidence).toBeGreaterThan(0);
        expect(insight.confidence).toBeLessThanOrEqual(100);
        expect(insight.dataRange).toBeDefined();
        expect(insight.affectedMetrics).toBeDefined();
        expect(Array.isArray(insight.affectedMetrics)).toBe(true);
      });
    });

    it('should include trend analysis for sufficient data', async () => {
      // Add more daily metrics for trend analysis
      const extendedMetrics: DailyMetrics[] = [];
      for (let i = 0; i < 15; i++) {
        extendedMetrics.push({
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          totalCom: 100 + Math.random() * 50,
          adSpend: 80 + Math.random() * 20,
          profit: 20 + Math.random() * 30,
          roi: 25 + Math.random() * 25,
          ordersSP: 2,
          ordersLZD: 1
        });
      }
      mockData.dailyMetrics = extendedMetrics;

      const insights = await aiAnalysisService.getInsights(mockData);

      const trendInsight = insights.find(i => i.type === 'trend');
      expect(trendInsight).toBeDefined();
      expect(trendInsight?.title).toContain('Trend');
      expect(trendInsight?.visualizationData).toBeDefined();
    });
  });

  describe('optimizeBudget', () => {
    it('should generate budget optimization recommendations', async () => {
      const optimization = await aiAnalysisService.optimizeBudget(mockData);

      expect(optimization).toBeDefined();
      expect(optimization.id).toBeDefined();
      expect(optimization.currentAllocation).toBeDefined();
      expect(optimization.recommendedAllocation).toBeDefined();
      expect(optimization.expectedImprovement).toBeDefined();
      expect(optimization.riskAssessment).toBeDefined();
      expect(optimization.justification).toBeDefined();
      expect(optimization.constraints).toBeDefined();

      // Check allocation arrays
      expect(optimization.currentAllocation.length).toBeGreaterThan(0);
      expect(optimization.recommendedAllocation.length).toBe(optimization.currentAllocation.length);

      // Verify budget conservation
      const currentTotal = optimization.currentAllocation.reduce((sum, alloc) => sum + alloc.currentBudget, 0);
      const recommendedTotal = optimization.recommendedAllocation.reduce((sum, alloc) => sum + alloc.recommendedBudget, 0);
      
      expect(Math.abs(currentTotal - recommendedTotal)).toBeLessThan(1); // Allow for rounding errors
    });

    it('should include constraints and justification', async () => {
      const optimization = await aiAnalysisService.optimizeBudget(mockData);

      expect(optimization.constraints.length).toBeGreaterThan(0);
      expect(optimization.justification.length).toBeGreaterThan(0);
      
      optimization.constraints.forEach(constraint => {
        expect(constraint.type).toBeDefined();
        expect(constraint.value).toBeGreaterThan(0);
        expect(constraint.description).toBeDefined();
      });
    });
  });
});