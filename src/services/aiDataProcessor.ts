// AI Data Processor Service
// Handles data transformation and validation for AI analysis

import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';
import { AIAnalysisData, AIDataProcessor, AIEnhancedMetrics } from '@/types/ai';

class AIDataProcessorService implements AIDataProcessor {
  
  processRawData(
    shopeeOrders: any[],
    lazadaOrders: any[],
    facebookAds: any[],
    calculatedMetrics: CalculatedMetrics,
    dailyMetrics: DailyMetrics[]
  ): AIAnalysisData {
    console.log('🤖 AI Data Processor: Processing raw data for AI analysis');
    
    // Extract unique Sub IDs from all sources
    const subIds = this.extractSubIds(shopeeOrders, lazadaOrders, facebookAds);
    
    // Extract platforms
    const platforms = this.extractPlatforms(shopeeOrders, lazadaOrders, facebookAds);
    
    // Determine date range from data
    const dateRange = this.calculateDateRange(shopeeOrders, lazadaOrders, facebookAds, dailyMetrics);
    
    const processedData: AIAnalysisData = {
      shopeeOrders: this.cleanShopeeOrders(shopeeOrders),
      lazadaOrders: this.cleanLazadaOrders(lazadaOrders),
      facebookAds: this.cleanFacebookAds(facebookAds),
      calculatedMetrics,
      dailyMetrics,
      dateRange,
      subIds,
      platforms
    };

    console.log('🤖 AI Data Processor: Processed data summary:', {
      shopeeOrders: processedData.shopeeOrders.length,
      lazadaOrders: processedData.lazadaOrders.length,
      facebookAds: processedData.facebookAds.length,
      subIds: processedData.subIds.length,
      platforms: processedData.platforms.length,
      dateRange: processedData.dateRange
    });

    return processedData;
  }

  validateData(data: AIAnalysisData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check minimum data requirements
    const totalRecords = data.shopeeOrders.length + data.lazadaOrders.length + data.facebookAds.length;
    if (totalRecords < 10) {
      errors.push('Insufficient data: At least 10 records required for AI analysis');
    }

    // Check for calculated metrics
    if (!data.calculatedMetrics) {
      errors.push('Missing calculated metrics required for AI analysis');
    }

    // Check date range validity
    if (!data.dateRange.from || !data.dateRange.to) {
      errors.push('Invalid date range: Both start and end dates are required');
    } else if (data.dateRange.from >= data.dateRange.to) {
      errors.push('Invalid date range: Start date must be before end date');
    }

    // Check for Sub IDs
    if (data.subIds.length === 0) {
      errors.push('No Sub IDs found in data - this may limit AI analysis capabilities');
    }

    // Validate daily metrics consistency
    if (data.dailyMetrics.length > 0) {
      const invalidDailyMetrics = data.dailyMetrics.filter(metric => 
        isNaN(metric.totalCom) || isNaN(metric.adSpend) || isNaN(metric.roi)
      );
      
      if (invalidDailyMetrics.length > 0) {
        errors.push(`${invalidDailyMetrics.length} daily metrics contain invalid numerical values`);
      }
    }

    // Check data freshness
    const daysSinceLastData = data.dailyMetrics.length > 0 
      ? Math.floor((Date.now() - new Date(data.dailyMetrics[data.dailyMetrics.length - 1].date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceLastData > 30) {
      errors.push('Data appears to be outdated (>30 days old) - consider importing recent data');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  enrichData(data: AIAnalysisData): AIAnalysisData {
    console.log('🤖 AI Data Processor: Enriching data with additional insights');

    // Add enhanced metrics
    const enhancedMetrics = this.calculateEnhancedMetrics(data);
    
    // Add performance indicators to orders
    const enrichedShopeeOrders = this.addPerformanceIndicators(data.shopeeOrders, 'shopee');
    const enrichedLazadaOrders = this.addPerformanceIndicators(data.lazadaOrders, 'lazada');
    const enrichedFacebookAds = this.addPerformanceIndicators(data.facebookAds, 'facebook');

    return {
      ...data,
      shopeeOrders: enrichedShopeeOrders,
      lazadaOrders: enrichedLazadaOrders,
      facebookAds: enrichedFacebookAds,
      calculatedMetrics: enhancedMetrics
    };
  }

  // Private helper methods

  private extractSubIds(shopeeOrders: any[], lazadaOrders: any[], facebookAds: any[]): string[] {
    const subIds = new Set<string>();

    // Extract from Shopee orders
    shopeeOrders.forEach(order => {
      const orderSubIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5'],
        order.sub_id
      ].filter(Boolean);
      
      orderSubIds.forEach(subId => subIds.add(subId));
    });

    // Extract from Lazada orders
    lazadaOrders.forEach(order => {
      const orderSubIds = [
        order['Aff Sub ID'],
        order['Sub ID 1'],
        order['Sub ID 2'],
        order['Sub ID 3'],
        order['Sub ID 4'],
        order['Sub ID']
      ].filter(Boolean);
      
      orderSubIds.forEach(subId => subIds.add(subId));
    });

    // Extract from Facebook ads
    facebookAds.forEach(ad => {
      if (ad['Sub ID']) {
        subIds.add(ad['Sub ID']);
      }
      
      // Also extract from campaign/ad names
      const campaignName = ad['Campaign name'] || '';
      const adSetName = ad['Ad set name'] || '';
      const adName = ad['Ad name'] || '';
      
      // Simple pattern matching for Sub IDs in names
      const nameText = `${campaignName} ${adSetName} ${adName}`.toLowerCase();
      const subIdMatches = nameText.match(/sub[_\s]*id[_\s]*(\w+)/gi);
      
      if (subIdMatches) {
        subIdMatches.forEach(match => {
          const extractedSubId = match.replace(/sub[_\s]*id[_\s]*/gi, '');
          if (extractedSubId) {
            subIds.add(extractedSubId);
          }
        });
      }
    });

    return Array.from(subIds).filter(subId => subId && subId.length > 0);
  }

  private extractPlatforms(shopeeOrders: any[], lazadaOrders: any[], facebookAds: any[]): string[] {
    const platforms: string[] = [];
    
    if (shopeeOrders.length > 0) platforms.push('Shopee');
    if (lazadaOrders.length > 0) platforms.push('Lazada');
    if (facebookAds.length > 0) platforms.push('Facebook');
    
    return platforms;
  }

  private calculateDateRange(
    shopeeOrders: any[], 
    lazadaOrders: any[], 
    facebookAds: any[], 
    dailyMetrics: DailyMetrics[]
  ): { from: Date; to: Date } {
    const dates: Date[] = [];

    // Get dates from daily metrics (most reliable)
    if (dailyMetrics.length > 0) {
      dailyMetrics.forEach(metric => {
        const date = new Date(metric.date);
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      });
    }

    // Fallback to order dates
    if (dates.length === 0) {
      // Shopee order dates
      shopeeOrders.forEach(order => {
        const dateStr = order['วันที่สั่งซื้อ'] || order['เวลาที่สั่งซื้อ'];
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        }
      });

      // Lazada order dates
      lazadaOrders.forEach(order => {
        const dateStr = order['Order Time'] || order['Conversion Time'];
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        }
      });

      // Facebook ad dates
      facebookAds.forEach(ad => {
        const dateStr = ad['Date'] || ad['Day'];
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        }
      });
    }

    // Default to last 30 days if no dates found
    if (dates.length === 0) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return { from: thirtyDaysAgo, to: now };
    }

    // Find min and max dates
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    return {
      from: sortedDates[0],
      to: sortedDates[sortedDates.length - 1]
    };
  }

  private cleanShopeeOrders(orders: any[]): any[] {
    return orders.map(order => ({
      ...order,
      // Ensure numeric fields are properly parsed
      commission: this.parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']),
      orderValue: this.parseNumber(order['มูลค่าซื้อ(฿)'] || order['ยอดขายสินค้าโดยรวม(฿)']),
      // Standardize date format
      orderDate: this.parseDate(order['วันที่สั่งซื้อ'] || order['เวลาที่สั่งซื้อ']),
      // Clean Sub ID data
      subIds: [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean),
      platform: 'Shopee'
    }));
  }

  private cleanLazadaOrders(orders: any[]): any[] {
    return orders.map(order => ({
      ...order,
      // Ensure numeric fields are properly parsed
      commission: this.parseNumber(order['Payout']),
      orderValue: this.parseNumber(order['Order Amount']),
      // Standardize date format
      orderDate: this.parseDate(order['Order Time'] || order['Conversion Time']),
      // Clean Sub ID data
      subIds: [
        order['Aff Sub ID'],
        order['Sub ID 1'],
        order['Sub ID 2'],
        order['Sub ID 3'],
        order['Sub ID 4']
      ].filter(Boolean),
      platform: 'Lazada'
    }));
  }

  private cleanFacebookAds(ads: any[]): any[] {
    return ads.map(ad => ({
      ...ad,
      // Ensure numeric fields are properly parsed
      spend: this.parseNumber(ad['Amount spent (THB)'] || ad['Amount spent']),
      impressions: this.parseNumber(ad['Impressions']),
      clicks: this.parseNumber(ad['Link clicks']),
      reach: this.parseNumber(ad['Reach']),
      cpm: this.parseNumber(ad['CPM (cost per 1,000 impressions)']),
      cpc: this.parseNumber(ad['CPC (cost per link click)']),
      ctr: this.parseNumber(ad['CTR (link click-through rate)']),
      // Standardize date format
      adDate: this.parseDate(ad['Date'] || ad['Day']),
      // Extract Sub ID
      subId: ad['Sub ID'] || this.extractSubIdFromName(ad['Campaign name'], ad['Ad set name'], ad['Ad name']),
      platform: 'Facebook'
    }));
  }

  private calculateEnhancedMetrics(data: AIAnalysisData): AIEnhancedMetrics {
    const metrics = data.calculatedMetrics;
    const dailyMetrics = data.dailyMetrics;

    // Calculate trends
    const roiTrend = this.calculateTrend(dailyMetrics.map(d => d.roi));
    const revenueTrend = this.calculateTrend(dailyMetrics.map(d => d.totalCom));
    const ordersTrend = this.calculateTrend(dailyMetrics.map(d => d.ordersSP + d.ordersLZD));

    // Calculate efficiency metrics
    const totalOrders = metrics.totalOrdersSP + metrics.totalOrdersLZD;
    const costPerOrder = totalOrders > 0 ? metrics.totalAdsSpent / totalOrders : 0;
    const revenuePerOrder = totalOrders > 0 ? metrics.totalCom / totalOrders : 0;
    const conversionRate = metrics.totalLinkClicks > 0 ? (totalOrders / metrics.totalLinkClicks) * 100 : 0;

    // Calculate platform performance
    const shopeeROI = metrics.totalComSP > 0 && metrics.totalAdsSpent > 0 
      ? ((metrics.totalComSP - (metrics.totalAdsSpent * 0.6)) / (metrics.totalAdsSpent * 0.6)) * 100 
      : 0;
    const lazadaROI = metrics.totalComLZD > 0 && metrics.totalAdsSpent > 0 
      ? ((metrics.totalComLZD - (metrics.totalAdsSpent * 0.4)) / (metrics.totalAdsSpent * 0.4)) * 100 
      : 0;

    // Analyze Sub ID performance
    const subIdPerformance = this.analyzeSubIdPerformance(data);

    // Identify time-based patterns
    const timePatterns = this.analyzeTimePatterns(dailyMetrics);

    // Assess data quality
    const dataQuality = this.assessDataQuality(data);

    return {
      ...metrics,
      roiTrend: roiTrend > 1 ? 'improving' : roiTrend < -1 ? 'declining' : 'stable',
      revenueTrend: revenueTrend > 0 ? 'improving' : revenueTrend < 0 ? 'declining' : 'stable',
      ordersTrend: ordersTrend > 0 ? 'improving' : ordersTrend < 0 ? 'declining' : 'stable',
      costPerOrder,
      revenuePerOrder,
      conversionRate,
      platformPerformance: {
        shopee: { roi: shopeeROI, orders: metrics.totalOrdersSP, revenue: metrics.totalComSP },
        lazada: { roi: lazadaROI, orders: metrics.totalOrdersLZD, revenue: metrics.totalComLZD },
        facebook: { roi: metrics.roi, orders: totalOrders, revenue: metrics.totalCom }
      },
      topPerformingSubIds: subIdPerformance.top,
      underPerformingSubIds: subIdPerformance.bottom,
      bestPerformingDays: timePatterns.bestDays,
      worstPerformingDays: timePatterns.worstDays,
      seasonalPatterns: timePatterns.patterns,
      dataQuality
    };
  }

  private addPerformanceIndicators(records: any[], platform: string): any[] {
    return records.map(record => ({
      ...record,
      // Add AI-specific performance indicators
      _aiMetrics: {
        platform,
        performanceScore: this.calculatePerformanceScore(record, platform),
        riskLevel: this.assessRiskLevel(record, platform),
        optimizationPotential: this.assessOptimizationPotential(record, platform)
      }
    }));
  }

  // Utility methods

  private parseNumber(value: string | number | undefined): number {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    
    const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseDate(dateStr: string | undefined): Date | null {
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  private extractSubIdFromName(campaignName?: string, adSetName?: string, adName?: string): string | null {
    const fullName = `${campaignName || ''} ${adSetName || ''} ${adName || ''}`.toLowerCase();
    const subIdMatch = fullName.match(/sub[_\s]*id[_\s]*(\w+)/i);
    return subIdMatch ? subIdMatch[1] : null;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope || 0;
  }

  private analyzeSubIdPerformance(data: AIAnalysisData): {
    top: Array<{ subId: string; roi: number; orders: number; revenue: number; platform: string }>;
    bottom: Array<{ subId: string; roi: number; orders: number; revenue: number; platform: string }>;
  } {
    // Mock implementation - in real scenario, this would analyze actual Sub ID performance
    const subIdStats = data.subIds.slice(0, 10).map(subId => ({
      subId,
      roi: 20 + Math.random() * 80, // Mock ROI between 20-100%
      orders: Math.floor(Math.random() * 50) + 1,
      revenue: Math.random() * 5000 + 500,
      platform: Math.random() > 0.5 ? 'Shopee' : 'Lazada'
    }));

    const sorted = subIdStats.sort((a, b) => b.roi - a.roi);
    
    return {
      top: sorted.slice(0, 3),
      bottom: sorted.slice(-3)
    };
  }

  private analyzeTimePatterns(dailyMetrics: DailyMetrics[]): {
    bestDays: string[];
    worstDays: string[];
    patterns: Array<{ period: string; avgROI: number; avgOrders: number }>;
  } {
    if (dailyMetrics.length === 0) {
      return { bestDays: [], worstDays: [], patterns: [] };
    }

    const sorted = [...dailyMetrics].sort((a, b) => b.roi - a.roi);
    
    return {
      bestDays: sorted.slice(0, 3).map(d => d.date),
      worstDays: sorted.slice(-3).map(d => d.date),
      patterns: [
        {
          period: 'Recent 7 days',
          avgROI: dailyMetrics.slice(-7).reduce((sum, d) => sum + d.roi, 0) / Math.min(7, dailyMetrics.length),
          avgOrders: dailyMetrics.slice(-7).reduce((sum, d) => sum + d.ordersSP + d.ordersLZD, 0) / Math.min(7, dailyMetrics.length)
        }
      ]
    };
  }

  private assessDataQuality(data: AIAnalysisData): {
    completeness: number;
    consistency: number;
    freshness: number;
    reliability: number;
  } {
    const totalRecords = data.shopeeOrders.length + data.lazadaOrders.length + data.facebookAds.length;
    
    // Mock data quality assessment
    return {
      completeness: Math.min(100, (totalRecords / 100) * 100), // Based on record count
      consistency: 85 + Math.random() * 10, // Mock consistency score
      freshness: Math.max(0, 100 - (data.dailyMetrics.length > 0 ? 
        Math.floor((Date.now() - new Date(data.dailyMetrics[data.dailyMetrics.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)) * 3 : 30)),
      reliability: 80 + Math.random() * 15 // Mock reliability score
    };
  }

  private calculatePerformanceScore(record: any, platform: string): number {
    // Mock performance score calculation
    return 60 + Math.random() * 40; // Score between 60-100
  }

  private assessRiskLevel(record: any, platform: string): 'low' | 'medium' | 'high' {
    const score = Math.random();
    return score > 0.7 ? 'low' : score > 0.4 ? 'medium' : 'high';
  }

  private assessOptimizationPotential(record: any, platform: string): number {
    return Math.random() * 100; // Potential score 0-100
  }
}

// Export singleton instance
export const aiDataProcessor = new AIDataProcessorService();