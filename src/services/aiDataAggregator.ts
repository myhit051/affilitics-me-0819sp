// AI Data Aggregation Service
// Consumes existing data from useImportedData hook and transforms it for AI analysis

import { CalculatedMetrics, DailyMetrics, analyzeSubIdPerformance, analyzePlatformPerformance } from '@/utils/affiliateCalculations';
import { dataMerger } from '@/lib/data-merger';
import { aiDataProcessor } from './aiDataProcessor';
import { AIAnalysisData, AIEnhancedMetrics } from '@/types/ai';

interface AggregationResult {
  aiData: AIAnalysisData;
  aggregationStats: {
    totalRecordsProcessed: number;
    dataSourceBreakdown: {
      shopee: { fileImport: number; facebookApi: number; merged: number };
      lazada: { fileImport: number; facebookApi: number; merged: number };
      facebook: { fileImport: number; facebookApi: number; merged: number };
    };
    dataQualityScore: number;
    processingTime: number;
  };
  warnings: string[];
  errors: string[];
}

class AIDataAggregatorService {
  
  /**
   * Main aggregation method that processes data from useImportedData hook
   * Integrates with existing data structures and data-merger functionality
   */
  async aggregateDataForAI(
    shopeeOrders: any[],
    lazadaOrders: any[],
    facebookAds: any[],
    calculatedMetrics: CalculatedMetrics,
    dailyMetrics: DailyMetrics[],
    rawData?: any,
    subIdAnalysis?: any[],
    platformAnalysis?: any[]
  ): Promise<AggregationResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    console.log('🔄 AI Data Aggregator: Starting data aggregation for AI analysis');

    try {
      // Step 1: Analyze data sources and merge if needed
      const mergedData = await this.handleDataSourceMerging(
        shopeeOrders,
        lazadaOrders,
        facebookAds,
        warnings
      );

      // Step 2: Transform data for AI analysis using existing calculation functions
      const transformedData = this.transformForAIAnalysis(
        mergedData.shopeeOrders,
        mergedData.lazadaOrders,
        mergedData.facebookAds
      );

      // Step 3: Process data using AI data processor
      const aiData = aiDataProcessor.processRawData(
        transformedData.transformedShopeeOrders,
        transformedData.transformedLazadaOrders,
        transformedData.transformedFacebookAds,
        calculatedMetrics,
        dailyMetrics
      );

      // Step 4: Integrate existing analysis results if provided
      if (subIdAnalysis && platformAnalysis) {
        aiData.subIdAnalysis = subIdAnalysis;
        aiData.platformAnalysis = platformAnalysis;
      } else {
        // Generate analysis using existing calculation functions
        aiData.subIdAnalysis = analyzeSubIdPerformance(
          mergedData.shopeeOrders,
          mergedData.lazadaOrders,
          mergedData.facebookAds,
          calculatedMetrics.totalAdsSpent
        );
        aiData.platformAnalysis = analyzePlatformPerformance(
          mergedData.shopeeOrders,
          mergedData.lazadaOrders,
          calculatedMetrics.totalAdsSpent
        );
      }

      // Step 5: Validate data quality
      const validation = aiDataProcessor.validateData(aiData);
      if (!validation.isValid) {
        warnings.push(...validation.errors);
      }

      // Step 6: Enrich data with AI-specific metrics
      const enrichedData = aiDataProcessor.enrichData(aiData);

      // Step 7: Calculate aggregation statistics
      const aggregationStats = this.calculateAggregationStats(
        mergedData,
        enrichedData,
        transformedData.transformationStats,
        Date.now() - startTime
      );

      console.log('✅ AI Data Aggregator: Aggregation completed successfully', {
        totalRecords: aggregationStats.totalRecordsProcessed,
        dataQuality: aggregationStats.dataQualityScore,
        processingTime: aggregationStats.processingTime
      });

      return {
        aiData: enrichedData,
        aggregationStats,
        warnings,
        errors
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown aggregation error';
      errors.push(errorMessage);
      console.error('❌ AI Data Aggregator: Aggregation failed:', error);

      // Return minimal data structure even on error
      const transformedFallback = this.transformForAIAnalysis(
        shopeeOrders,
        lazadaOrders,
        facebookAds
      );
      
      const fallbackData = aiDataProcessor.processRawData(
        transformedFallback.transformedShopeeOrders,
        transformedFallback.transformedLazadaOrders,
        transformedFallback.transformedFacebookAds,
        calculatedMetrics,
        dailyMetrics
      );

      return {
        aiData: fallbackData,
        aggregationStats: {
          totalRecordsProcessed: shopeeOrders.length + lazadaOrders.length + facebookAds.length,
          dataSourceBreakdown: {
            shopee: { fileImport: shopeeOrders.length, facebookApi: 0, merged: 0 },
            lazada: { fileImport: lazadaOrders.length, facebookApi: 0, merged: 0 },
            facebook: { fileImport: facebookAds.length, facebookApi: 0, merged: 0 }
          },
          dataQualityScore: 50, // Low score due to error
          processingTime: Date.now() - startTime
        },
        warnings,
        errors
      };
    }
  }

  /**
   * Handles data source merging using existing data-merger functionality
   */
  private async handleDataSourceMerging(
    shopeeOrders: any[],
    lazadaOrders: any[],
    facebookAds: any[],
    warnings: string[]
  ): Promise<{
    shopeeOrders: any[];
    lazadaOrders: any[];
    facebookAds: any[];
    mergeResults?: any;
  }> {
    // Check if we have data from multiple sources
    const hasFileData = this.hasFileImportData(shopeeOrders, lazadaOrders, facebookAds);
    const hasApiData = this.hasFacebookApiData(shopeeOrders, lazadaOrders, facebookAds);

    if (hasFileData && hasApiData) {
      console.log('🔄 AI Data Aggregator: Detected multiple data sources, performing merge');

      try {
        // Separate data by source
        const fileData = {
          shopeeOrders: shopeeOrders.filter(order => !order._dataSource || order._dataSource === 'file_import'),
          lazadaOrders: lazadaOrders.filter(order => !order._dataSource || order._dataSource === 'file_import'),
          facebookAds: facebookAds.filter(ad => !ad._dataSource || ad._dataSource === 'file_import'),
          campaigns: []
        };

        const apiData = {
          shopeeOrders: shopeeOrders.filter(order => order._dataSource === 'facebook_api'),
          lazadaOrders: lazadaOrders.filter(order => order._dataSource === 'facebook_api'),
          facebookAds: facebookAds.filter(ad => ad._dataSource === 'facebook_api'),
          campaigns: []
        };

        // Perform comprehensive merge
        const mergeResult = dataMerger.mergeAllData(fileData, apiData);

        // Detect and handle conflicts
        const conflictAnalysis = dataMerger.detectCrossPlatformConflicts(
          mergeResult.mergedData.shopeeOrders,
          mergeResult.mergedData.lazadaOrders,
          mergeResult.mergedData.facebookAds
        );

        if (conflictAnalysis.conflicts.length > 0) {
          warnings.push(`Found ${conflictAnalysis.conflicts.length} data conflicts during merge`);
          warnings.push(...conflictAnalysis.recommendations);
        }

        // Strip data source tracking for AI processing
        return {
          shopeeOrders: dataMerger.stripDataSourceTracking(mergeResult.mergedData.shopeeOrders),
          lazadaOrders: dataMerger.stripDataSourceTracking(mergeResult.mergedData.lazadaOrders),
          facebookAds: dataMerger.stripDataSourceTracking(mergeResult.mergedData.facebookAds),
          mergeResults: mergeResult.mergeResults
        };

      } catch (mergeError) {
        console.warn('⚠️ AI Data Aggregator: Merge failed, using original data:', mergeError);
        warnings.push('Data merge failed, using original data without merging');
        
        return {
          shopeeOrders,
          lazadaOrders,
          facebookAds
        };
      }
    }

    // No merging needed, return original data
    return {
      shopeeOrders,
      lazadaOrders,
      facebookAds
    };
  }

  /**
   * Transforms existing data structures for AI analysis compatibility
   */
  transformForAIAnalysis(
    shopeeOrders: any[],
    lazadaOrders: any[],
    facebookAds: any[]
  ): {
    transformedShopeeOrders: any[];
    transformedLazadaOrders: any[];
    transformedFacebookAds: any[];
    transformationStats: {
      shopeeTransformed: number;
      lazadaTransformed: number;
      facebookTransformed: number;
      fieldsStandardized: string[];
    };
  } {
    console.log('🔄 AI Data Aggregator: Transforming data structures for AI compatibility');

    const fieldsStandardized: string[] = [];

    // Transform Shopee orders with enhanced field mapping
    const transformedShopeeOrders = shopeeOrders.map(order => {
      // Parse date more reliably
      const orderDate = this.parseDate(order['เวลาที่สั่งซื้อ']) || 
                       this.parseDate(order['วันที่สั่งซื้อ']) ||
                       this.parseDate(order['Order Time']) ||
                       this.parseDate(order['Date']);

      const transformed = {
        ...order,
        // Standardize field names for AI processing
        orderId: order['รหัสการสั่งซื้อ'] || order['Order ID'],
        commission: this.parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || order['Commission']),
        orderValue: this.parseNumber(order['มูลค่าซื้อ(฿)'] || order['ยอดขายสินค้าโดยรวม(฿)'] || order['Order Value']),
        productPrice: this.parseNumber(order['ราคาสินค้า(฿)'] || order['Product Price']),
        orderDate,
        status: order['สถานะการสั่งซื้อ'] || order['สถานะ'] || order['Status'],
        channel: order['ช่องทาง'] || order['Channel'],
        productName: order['ชื่อสินค้า'] || order['ชื่อรายการสินค้า'] || order['Product Name'],
        platform: 'Shopee',
        // Extract all Sub IDs with fallback handling
        subIds: [
          order['Sub_id1'],
          order['Sub_id2'], 
          order['Sub_id3'],
          order['Sub_id4'],
          order['Sub_id5'],
          order.sub_id,
          order['Sub ID']
        ].filter(Boolean),
        // AI-specific fields
        _aiProcessed: true,
        _aiTimestamp: new Date(),
        _originalFields: Object.keys(order) // Track original field names for debugging
      };

      return transformed;
    });

    // Transform Lazada orders with enhanced field mapping
    const transformedLazadaOrders = lazadaOrders.map(order => {
      // Parse date more reliably
      const orderDate = this.parseDate(order['Conversion Time']) ||
                       this.parseDate(order['Order Time']) ||
                       this.parseDate(order['Date']);

      const transformed = {
        ...order,
        // Standardize field names for AI processing
        orderId: order['Check Out ID'] || order['Order Number'],
        skuOrderId: order['Sku Order ID'], // Important for Lazada order counting
        commission: this.parseNumber(order['Payout']),
        orderValue: this.parseNumber(order['Order Amount']),
        orderDate,
        status: order['Order Status'] || order['Status'],
        validity: order['Validity'],
        itemName: order['Item Name'],
        sku: order['SKU'],
        shippingFee: this.parseNumber(order['Shipping Fee']),
        voucherAmount: this.parseNumber(order['Voucher Amount']),
        platform: 'Lazada',
        // Extract all Sub IDs with fallback handling
        subIds: [
          order['Aff Sub ID'],
          order['Sub ID 1'],
          order['Sub ID 2'],
          order['Sub ID 3'],
          order['Sub ID 4'],
          order['Sub ID']
        ].filter(Boolean),
        // AI-specific fields
        _aiProcessed: true,
        _aiTimestamp: new Date(),
        _originalFields: Object.keys(order) // Track original field names for debugging
      };

      return transformed;
    });

    // Transform Facebook ads with enhanced field mapping
    const transformedFacebookAds = facebookAds.map(ad => {
      // Parse date more reliably
      const adDate = this.parseDate(ad['Date']) || 
                    this.parseDate(ad['Day']) ||
                    this.parseDate(ad['date']);

      const transformed = {
        ...ad,
        // Standardize field names for AI processing
        campaignName: ad['Campaign name'] || ad['campaign_name'],
        adSetName: ad['Ad set name'] || ad['adset_name'],
        adName: ad['Ad name'] || ad['ad_name'],
        spend: this.parseNumber(ad['Amount spent (THB)'] || ad['Amount spent'] || ad['spend']),
        impressions: this.parseNumber(ad['Impressions'] || ad['impressions']),
        clicks: this.parseNumber(ad['Link clicks'] || ad['clicks']),
        landingPageViews: this.parseNumber(ad['Landing page views']),
        reach: this.parseNumber(ad['Reach'] || ad['reach']),
        frequency: this.parseNumber(ad['Frequency']),
        cpm: this.parseNumber(ad['CPM (cost per 1,000 impressions)'] || ad['cpm']),
        cpc: this.parseNumber(ad['CPC (cost per link click)'] || ad['cpc']),
        ctr: this.parseNumber(ad['CTR (link click-through rate)'] || ad['ctr']),
        adDate,
        platform: 'Facebook',
        // Extract Sub ID with multiple fallback methods
        subId: ad['Sub ID'] || 
               ad['sub_id'] ||
               this.extractSubIdFromCampaignName(ad['Campaign name'], ad['Ad set name'], ad['Ad name']),
        // AI-specific fields
        _aiProcessed: true,
        _aiTimestamp: new Date(),
        _originalFields: Object.keys(ad) // Track original field names for debugging
      };

      return transformed;
    });

    fieldsStandardized.push(
      'orderId', 'commission', 'orderValue', 'orderDate', 'platform', 'subIds',
      'campaignName', 'spend', 'impressions', 'clicks', 'subId'
    );

    return {
      transformedShopeeOrders,
      transformedLazadaOrders,
      transformedFacebookAds,
      transformationStats: {
        shopeeTransformed: transformedShopeeOrders.length,
        lazadaTransformed: transformedLazadaOrders.length,
        facebookTransformed: transformedFacebookAds.length,
        fieldsStandardized
      }
    };
  }

  /**
   * Convenience method to aggregate data directly from useImportedData hook results
   * This method integrates seamlessly with the existing data flow
   */
  async aggregateFromImportedData(importedDataResult: {
    importedData: any;
    calculatedMetrics: CalculatedMetrics;
    dailyMetrics: DailyMetrics[];
    subIdAnalysis: any[];
    platformAnalysis: any[];
    rawData?: any;
  }): Promise<AggregationResult> {
    const { importedData, calculatedMetrics, dailyMetrics, subIdAnalysis, platformAnalysis, rawData } = importedDataResult;

    if (!importedData) {
      throw new Error('No imported data available for AI analysis');
    }

    console.log('🔄 AI Data Aggregator: Processing data from useImportedData hook', {
      shopeeOrders: importedData.shopeeOrders?.length || 0,
      lazadaOrders: importedData.lazadaOrders?.length || 0,
      facebookAds: importedData.facebookAds?.length || 0,
      hasCalculatedMetrics: !!calculatedMetrics,
      hasDailyMetrics: dailyMetrics?.length || 0,
      hasSubIdAnalysis: subIdAnalysis?.length || 0,
      hasPlatformAnalysis: platformAnalysis?.length || 0
    });

    return this.aggregateDataForAI(
      importedData.shopeeOrders || [],
      importedData.lazadaOrders || [],
      importedData.facebookAds || [],
      calculatedMetrics,
      dailyMetrics || [],
      rawData,
      subIdAnalysis,
      platformAnalysis
    );
  }

  /**
   * Aggregates performance metrics across platforms for AI analysis
   */
  aggregatePerformanceMetrics(
    calculatedMetrics: CalculatedMetrics,
    dailyMetrics: DailyMetrics[]
  ): {
    aggregatedMetrics: AIEnhancedMetrics;
    performanceInsights: {
      topPerformingPlatform: string;
      mostConsistentPlatform: string;
      growthTrend: 'improving' | 'declining' | 'stable';
      seasonalPatterns: Array<{
        period: string;
        avgPerformance: number;
        trend: string;
      }>;
    };
  } {
    console.log('🔄 AI Data Aggregator: Aggregating performance metrics');

    // Calculate platform-specific performance
    const shopeeROI = calculatedMetrics.totalComSP > 0 && calculatedMetrics.totalAdsSpent > 0
      ? ((calculatedMetrics.totalComSP - (calculatedMetrics.totalAdsSpent * 0.6)) / (calculatedMetrics.totalAdsSpent * 0.6)) * 100
      : 0;

    const lazadaROI = calculatedMetrics.totalComLZD > 0 && calculatedMetrics.totalAdsSpent > 0
      ? ((calculatedMetrics.totalComLZD - (calculatedMetrics.totalAdsSpent * 0.4)) / (calculatedMetrics.totalAdsSpent * 0.4)) * 100
      : 0;

    // Determine top performing platform
    const platformPerformance = [
      { platform: 'Shopee', roi: shopeeROI, orders: calculatedMetrics.totalOrdersSP },
      { platform: 'Lazada', roi: lazadaROI, orders: calculatedMetrics.totalOrdersLZD },
      { platform: 'Facebook', roi: calculatedMetrics.roi, orders: calculatedMetrics.totalOrdersSP + calculatedMetrics.totalOrdersLZD }
    ].sort((a, b) => b.roi - a.roi);

    const topPerformingPlatform = platformPerformance[0].platform;

    // Calculate consistency (lower variance = more consistent)
    const roiVariances = this.calculatePlatformConsistency(dailyMetrics);
    const mostConsistentPlatform = Object.entries(roiVariances)
      .sort(([,a], [,b]) => a - b)[0][0];

    // Determine growth trend
    const growthTrend = this.calculateGrowthTrend(dailyMetrics);

    // Identify seasonal patterns
    const seasonalPatterns = this.identifySeasonalPatterns(dailyMetrics);

    // Create enhanced metrics
    const aggregatedMetrics: AIEnhancedMetrics = {
      ...calculatedMetrics,
      // Performance trends
      roiTrend: growthTrend,
      revenueTrend: this.calculateRevenueTrend(dailyMetrics),
      ordersTrend: this.calculateOrdersTrend(dailyMetrics),
      
      // Efficiency metrics
      costPerOrder: (calculatedMetrics.totalOrdersSP + calculatedMetrics.totalOrdersLZD) > 0
        ? calculatedMetrics.totalAdsSpent / (calculatedMetrics.totalOrdersSP + calculatedMetrics.totalOrdersLZD)
        : 0,
      revenuePerOrder: (calculatedMetrics.totalOrdersSP + calculatedMetrics.totalOrdersLZD) > 0
        ? calculatedMetrics.totalCom / (calculatedMetrics.totalOrdersSP + calculatedMetrics.totalOrdersLZD)
        : 0,
      conversionRate: calculatedMetrics.totalLinkClicks > 0
        ? ((calculatedMetrics.totalOrdersSP + calculatedMetrics.totalOrdersLZD) / calculatedMetrics.totalLinkClicks) * 100
        : 0,
      
      // Platform comparison
      platformPerformance: {
        shopee: { roi: shopeeROI, orders: calculatedMetrics.totalOrdersSP, revenue: calculatedMetrics.totalComSP },
        lazada: { roi: lazadaROI, orders: calculatedMetrics.totalOrdersLZD, revenue: calculatedMetrics.totalComLZD },
        facebook: { roi: calculatedMetrics.roi, orders: calculatedMetrics.totalOrdersSP + calculatedMetrics.totalOrdersLZD, revenue: calculatedMetrics.totalCom }
      },
      
      // Mock Sub ID performance (would be calculated from actual data in real implementation)
      topPerformingSubIds: [],
      underPerformingSubIds: [],
      
      // Time-based patterns
      bestPerformingDays: this.getBestPerformingDays(dailyMetrics),
      worstPerformingDays: this.getWorstPerformingDays(dailyMetrics),
      seasonalPatterns,
      
      // Data quality assessment
      dataQuality: {
        completeness: this.assessDataCompleteness(calculatedMetrics),
        consistency: this.assessDataConsistency(dailyMetrics),
        freshness: this.assessDataFreshness(dailyMetrics),
        reliability: this.assessDataReliability(calculatedMetrics, dailyMetrics)
      }
    };

    return {
      aggregatedMetrics,
      performanceInsights: {
        topPerformingPlatform,
        mostConsistentPlatform,
        growthTrend,
        seasonalPatterns
      }
    };
  }

  // Private helper methods

  private hasFileImportData(shopeeOrders: any[], lazadaOrders: any[], facebookAds: any[]): boolean {
    return shopeeOrders.some(order => !order._dataSource || order._dataSource === 'file_import') ||
           lazadaOrders.some(order => !order._dataSource || order._dataSource === 'file_import') ||
           facebookAds.some(ad => !ad._dataSource || ad._dataSource === 'file_import');
  }

  private hasFacebookApiData(shopeeOrders: any[], lazadaOrders: any[], facebookAds: any[]): boolean {
    return shopeeOrders.some(order => order._dataSource === 'facebook_api') ||
           lazadaOrders.some(order => order._dataSource === 'facebook_api') ||
           facebookAds.some(ad => ad._dataSource === 'facebook_api');
  }

  private calculateAggregationStats(
    mergedData: any,
    enrichedData: AIAnalysisData,
    transformationStats: any,
    processingTime: number
  ): AggregationResult['aggregationStats'] {
    const totalRecords = enrichedData.shopeeOrders.length + 
                        enrichedData.lazadaOrders.length + 
                        enrichedData.facebookAds.length;

    // Calculate data quality score based on various factors
    const dataQualityScore = this.calculateDataQualityScore(enrichedData);

    // Calculate actual data source breakdown if merge results are available
    const dataSourceBreakdown = mergedData.mergeResults ? {
      shopee: this.calculateDataSourceStats(mergedData.mergeResults.shopee?.mergedData || enrichedData.shopeeOrders),
      lazada: this.calculateDataSourceStats(mergedData.mergeResults.lazada?.mergedData || enrichedData.lazadaOrders),
      facebook: this.calculateDataSourceStats(mergedData.mergeResults.facebook?.mergedData || enrichedData.facebookAds)
    } : {
      shopee: { fileImport: enrichedData.shopeeOrders.length, facebookApi: 0, merged: 0, total: enrichedData.shopeeOrders.length },
      lazada: { fileImport: enrichedData.lazadaOrders.length, facebookApi: 0, merged: 0, total: enrichedData.lazadaOrders.length },
      facebook: { fileImport: enrichedData.facebookAds.length, facebookApi: 0, merged: 0, total: enrichedData.facebookAds.length }
    };

    return {
      totalRecordsProcessed: totalRecords,
      dataSourceBreakdown,
      dataQualityScore,
      processingTime
    };
  }

  private calculateDataQualityScore(data: AIAnalysisData): number {
    let score = 100;
    
    // Penalize for insufficient data
    const totalRecords = data.shopeeOrders.length + data.lazadaOrders.length + data.facebookAds.length;
    if (totalRecords < 50) score -= 20;
    else if (totalRecords < 100) score -= 10;
    
    // Penalize for missing Sub IDs
    if (data.subIds.length === 0) score -= 15;
    else if (data.subIds.length < 3) score -= 5;
    
    // Penalize for limited time range
    const daysDiff = Math.floor((data.dateRange.to.getTime() - data.dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) score -= 15;
    else if (daysDiff < 14) score -= 5;
    
    // Penalize for data freshness
    const daysSinceLastData = Math.floor((Date.now() - data.dateRange.to.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastData > 30) score -= 10;
    else if (daysSinceLastData > 7) score -= 5;
    
    return Math.max(0, score);
  }

  private parseNumber(value: string | number | undefined): number {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    
    const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseDate(dateStr: string | undefined): Date | null {
    if (!dateStr) return null;
    
    try {
      const trimmed = dateStr.trim();
      
      // Handle Thai date format (DD/MM/YYYY or DD/MM/YYYY HH:mm:ss)
      if (trimmed.includes('/')) {
        const [datePart] = trimmed.split(' '); // Remove time part if exists
        const parts = datePart.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = parseInt(parts[2]);
          
          // Validate date parts
          if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2000) {
            return new Date(year, month, day);
          }
        }
      }
      
      // Handle ISO format (YYYY-MM-DD or YYYY-MM-DD HH:mm:ss)
      if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [datePart] = trimmed.split(' '); // Remove time part if exists
        const [year, month, day] = datePart.split('-').map(Number);
        
        // Validate date parts
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000) {
          return new Date(year, month - 1, day); // month is 0-indexed
        }
      }
      
      // Try native Date parsing as fallback
      const nativeDate = new Date(trimmed);
      if (!isNaN(nativeDate.getTime()) && nativeDate.getFullYear() >= 2000) {
        return nativeDate;
      }
      
      return null;
    } catch (error) {
      console.warn('Date parsing error:', error, 'for value:', dateStr);
      return null;
    }
  }

  private extractSubIdFromCampaignName(campaignName?: string, adSetName?: string, adName?: string): string | null {
    const fullName = `${campaignName || ''} ${adSetName || ''} ${adName || ''}`.toLowerCase();
    
    // Try multiple patterns to extract Sub ID
    const patterns = [
      /sub[_\s]*id[_\s]*[:\-]?\s*(\w+)/i,  // sub_id: value or sub id value
      /campaign[_\s]*(\w+)/i,               // campaign_value
      /(\w+)[_\s]*campaign/i,               // value_campaign
      /id[_\s]*[:\-]?\s*(\w+)/i,           // id: value
      /(\w+)$/                              // last word as fallback
    ];
    
    for (const pattern of patterns) {
      const match = fullName.match(pattern);
      if (match && match[1] && match[1].length > 1) {
        return match[1];
      }
    }
    
    return null;
  }

  private calculatePlatformConsistency(dailyMetrics: DailyMetrics[]): Record<string, number> {
    // Mock implementation - would calculate actual variance in real scenario
    return {
      'Shopee': Math.random() * 10,
      'Lazada': Math.random() * 10,
      'Facebook': Math.random() * 10
    };
  }

  private calculateGrowthTrend(dailyMetrics: DailyMetrics[]): 'improving' | 'declining' | 'stable' {
    if (dailyMetrics.length < 2) return 'stable';
    
    const recentROI = dailyMetrics.slice(-3).reduce((sum, day) => sum + day.roi, 0) / Math.min(3, dailyMetrics.length);
    const earlierROI = dailyMetrics.slice(0, 3).reduce((sum, day) => sum + day.roi, 0) / Math.min(3, dailyMetrics.length);
    
    const change = ((recentROI - earlierROI) / earlierROI) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  private calculateRevenueTrend(dailyMetrics: DailyMetrics[]): 'improving' | 'declining' | 'stable' {
    if (dailyMetrics.length < 2) return 'stable';
    
    const recentRevenue = dailyMetrics.slice(-3).reduce((sum, day) => sum + day.totalCom, 0);
    const earlierRevenue = dailyMetrics.slice(0, 3).reduce((sum, day) => sum + day.totalCom, 0);
    
    const change = ((recentRevenue - earlierRevenue) / earlierRevenue) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  private calculateOrdersTrend(dailyMetrics: DailyMetrics[]): 'improving' | 'declining' | 'stable' {
    if (dailyMetrics.length < 2) return 'stable';
    
    const recentOrders = dailyMetrics.slice(-3).reduce((sum, day) => sum + day.ordersSP + day.ordersLZD, 0);
    const earlierOrders = dailyMetrics.slice(0, 3).reduce((sum, day) => sum + day.ordersSP + day.ordersLZD, 0);
    
    const change = ((recentOrders - earlierOrders) / earlierOrders) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  private identifySeasonalPatterns(dailyMetrics: DailyMetrics[]): Array<{ period: string; avgPerformance: number; trend: string }> {
    // Mock implementation - would analyze actual seasonal patterns
    return [
      {
        period: 'Recent 7 days',
        avgPerformance: dailyMetrics.slice(-7).reduce((sum, day) => sum + day.roi, 0) / Math.min(7, dailyMetrics.length),
        trend: 'stable'
      }
    ];
  }

  private getBestPerformingDays(dailyMetrics: DailyMetrics[]): string[] {
    return dailyMetrics
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 3)
      .map(day => day.date);
  }

  private getWorstPerformingDays(dailyMetrics: DailyMetrics[]): string[] {
    return dailyMetrics
      .sort((a, b) => a.roi - b.roi)
      .slice(0, 3)
      .map(day => day.date);
  }

  private assessDataCompleteness(metrics: CalculatedMetrics): number {
    let score = 100;
    
    if (metrics.totalAdsSpent === 0) score -= 25;
    if (metrics.totalCom === 0) score -= 25;
    if (metrics.totalOrdersSP === 0 && metrics.totalOrdersLZD === 0) score -= 25;
    if (metrics.totalLinkClicks === 0) score -= 25;
    
    return Math.max(0, score);
  }

  private assessDataConsistency(dailyMetrics: DailyMetrics[]): number {
    if (dailyMetrics.length === 0) return 0;
    
    // Calculate coefficient of variation for ROI
    const roiValues = dailyMetrics.map(d => d.roi);
    const mean = roiValues.reduce((sum, val) => sum + val, 0) / roiValues.length;
    const variance = roiValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / roiValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 100;
    
    // Lower coefficient of variation = higher consistency score
    return Math.max(0, 100 - cv);
  }

  private assessDataFreshness(dailyMetrics: DailyMetrics[]): number {
    if (dailyMetrics.length === 0) return 0;
    
    const latestDate = new Date(dailyMetrics[dailyMetrics.length - 1].date);
    const daysSinceLatest = Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLatest <= 1) return 100;
    if (daysSinceLatest <= 7) return 80;
    if (daysSinceLatest <= 30) return 60;
    return 30;
  }

  private assessDataReliability(metrics: CalculatedMetrics, dailyMetrics: DailyMetrics[]): number {
    let score = 100;
    
    // Check for extreme values that might indicate data issues
    if (metrics.roi > 1000 || metrics.roi < -100) score -= 20;
    if (metrics.totalAdsSpent > metrics.totalCom * 10) score -= 15;
    
    // Check daily metrics consistency
    const roiOutliers = dailyMetrics.filter(day => Math.abs(day.roi) > 500).length;
    if (roiOutliers > dailyMetrics.length * 0.1) score -= 15;
    
    return Math.max(0, score);
  }

  private calculateDataSourceStats(data: any[]): {
    fileImport: number;
    facebookApi: number;
    merged: number;
    total: number;
  } {
    const stats = {
      fileImport: 0,
      facebookApi: 0,
      merged: 0,
      total: data.length
    };

    data.forEach(item => {
      if (item._dataSource) {
        switch (item._dataSource) {
          case 'file_import':
            stats.fileImport++;
            break;
          case 'facebook_api':
            stats.facebookApi++;
            break;
          case 'merged':
            stats.merged++;
            break;
        }
      } else {
        // Assume file import if no data source specified
        stats.fileImport++;
      }
    });

    return stats;
  }

  /**
   * Validates that aggregated data is compatible with existing Dashboard components
   * This ensures seamless integration with the current system
   */
  validateDashboardCompatibility(
    aiData: AIAnalysisData,
    originalCalculatedMetrics: CalculatedMetrics,
    originalDailyMetrics: DailyMetrics[]
  ): {
    isCompatible: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Validate that core metrics are preserved
    const tolerance = 0.01; // 1% tolerance for floating point differences
    
    if (Math.abs(aiData.calculatedMetrics.totalCom - originalCalculatedMetrics.totalCom) > tolerance) {
      issues.push(`Total commission mismatch: AI=${aiData.calculatedMetrics.totalCom}, Original=${originalCalculatedMetrics.totalCom}`);
    }

    if (Math.abs(aiData.calculatedMetrics.totalAdsSpent - originalCalculatedMetrics.totalAdsSpent) > tolerance) {
      issues.push(`Total ads spent mismatch: AI=${aiData.calculatedMetrics.totalAdsSpent}, Original=${originalCalculatedMetrics.totalAdsSpent}`);
    }

    if (aiData.calculatedMetrics.totalOrdersSP !== originalCalculatedMetrics.totalOrdersSP) {
      issues.push(`Shopee orders count mismatch: AI=${aiData.calculatedMetrics.totalOrdersSP}, Original=${originalCalculatedMetrics.totalOrdersSP}`);
    }

    if (aiData.calculatedMetrics.totalOrdersLZD !== originalCalculatedMetrics.totalOrdersLZD) {
      issues.push(`Lazada orders count mismatch: AI=${aiData.calculatedMetrics.totalOrdersLZD}, Original=${originalCalculatedMetrics.totalOrdersLZD}`);
    }

    // Validate daily metrics consistency
    if (aiData.dailyMetrics.length !== originalDailyMetrics.length) {
      issues.push(`Daily metrics count mismatch: AI=${aiData.dailyMetrics.length}, Original=${originalDailyMetrics.length}`);
    }

    // Validate Sub IDs are extracted correctly
    if (aiData.subIds.length === 0 && (aiData.shopeeOrders.length > 0 || aiData.lazadaOrders.length > 0 || aiData.facebookAds.length > 0)) {
      issues.push('No Sub IDs extracted despite having order/ad data');
      recommendations.push('Review Sub ID extraction logic and field mapping');
    }

    // Validate platforms are identified
    const expectedPlatforms = [];
    if (aiData.shopeeOrders.length > 0) expectedPlatforms.push('Shopee');
    if (aiData.lazadaOrders.length > 0) expectedPlatforms.push('Lazada');
    if (aiData.facebookAds.length > 0) expectedPlatforms.push('Facebook');

    const missingPlatforms = expectedPlatforms.filter(p => !aiData.platforms.includes(p));
    if (missingPlatforms.length > 0) {
      issues.push(`Missing platforms: ${missingPlatforms.join(', ')}`);
      recommendations.push('Verify platform identification logic');
    }

    // Validate date ranges
    if (!aiData.dateRange.from || !aiData.dateRange.to) {
      issues.push('Invalid date range in AI data');
      recommendations.push('Ensure date parsing handles all data formats correctly');
    }

    if (issues.length === 0) {
      recommendations.push('Data integration is compatible with existing Dashboard components');
    }

    return {
      isCompatible: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Generates a comprehensive integration report for debugging and monitoring
   */
  generateIntegrationReport(
    aggregationResult: AggregationResult,
    originalData: {
      calculatedMetrics: CalculatedMetrics;
      dailyMetrics: DailyMetrics[];
      subIdAnalysis?: any[];
      platformAnalysis?: any[];
    }
  ): {
    summary: string;
    dataFlow: {
      inputRecords: number;
      processedRecords: number;
      transformedRecords: number;
      outputRecords: number;
    };
    qualityMetrics: {
      dataQualityScore: number;
      completeness: number;
      consistency: number;
      accuracy: number;
    };
    performance: {
      processingTime: number;
      recordsPerSecond: number;
      memoryUsage?: number;
    };
    compatibility: {
      isCompatible: boolean;
      issues: string[];
      recommendations: string[];
    };
  } {
    const compatibility = this.validateDashboardCompatibility(
      aggregationResult.aiData,
      originalData.calculatedMetrics,
      originalData.dailyMetrics
    );

    const inputRecords = aggregationResult.aiData.shopeeOrders.length + 
                        aggregationResult.aiData.lazadaOrders.length + 
                        aggregationResult.aiData.facebookAds.length;

    const recordsPerSecond = aggregationResult.aggregationStats.processingTime > 0 
      ? Math.round((inputRecords / aggregationResult.aggregationStats.processingTime) * 1000)
      : inputRecords > 0 ? inputRecords * 1000 : 0; // Assume very fast processing if time is 0

    return {
      summary: compatibility.isCompatible 
        ? `Successfully integrated ${inputRecords} records with ${aggregationResult.warnings.length} warnings`
        : `Integration completed with ${compatibility.issues.length} compatibility issues`,
      
      dataFlow: {
        inputRecords,
        processedRecords: aggregationResult.aggregationStats.totalRecordsProcessed,
        transformedRecords: inputRecords, // All records are transformed
        outputRecords: inputRecords
      },

      qualityMetrics: {
        dataQualityScore: aggregationResult.aggregationStats.dataQualityScore,
        completeness: this.assessDataCompleteness(aggregationResult.aiData.calculatedMetrics),
        consistency: this.assessDataConsistency(aggregationResult.aiData.dailyMetrics),
        accuracy: compatibility.isCompatible ? 100 : Math.max(0, 100 - (compatibility.issues.length * 10))
      },

      performance: {
        processingTime: aggregationResult.aggregationStats.processingTime,
        recordsPerSecond,
        memoryUsage: process.memoryUsage?.()?.heapUsed
      },

      compatibility
    };
  }
}

// Export singleton instance
export const aiDataAggregator = new AIDataAggregatorService();