// AI Data Models and Interfaces
// Extends existing types for AI analysis capabilities

import { CalculatedMetrics, DailyMetrics } from '@/utils/affiliateCalculations';

// Core AI Data Interfaces

export interface AIAnalysisData {
  shopeeOrders: any[];
  lazadaOrders: any[];
  facebookAds: any[];
  calculatedMetrics: CalculatedMetrics;
  dailyMetrics: DailyMetrics[];
  dateRange: {
    from: Date;
    to: Date;
  };
  subIds: string[];
  platforms: string[];
  subIdAnalysis?: any[];
  platformAnalysis?: any[];
}

export interface AIRecommendation {
  id: string;
  type: 'budget' | 'targeting' | 'creative' | 'platform' | 'subid';
  title: string;
  description: string;
  expectedImpact: number; // Percentage improvement expected
  confidenceScore: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  actionItems: AIActionItem[];
  estimatedROIImprovement: number;
  affectedSubIds?: string[];
  affectedPlatforms?: string[];
  reasoning: string;
  dataPoints: number; // Number of data points used for analysis
  createdAt: Date;
}

export interface AIActionItem {
  id: string;
  description: string;
  type: 'budget_adjustment' | 'pause_campaign' | 'increase_budget' | 'change_targeting' | 'optimize_creative';
  currentValue?: string | number;
  recommendedValue?: string | number;
  estimatedImpact: string;
}

export interface AIPrediction {
  id: string;
  type: 'roi' | 'revenue' | 'orders' | 'spend';
  timeframe: number; // Days
  predictedValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  confidenceScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  factors: AIPredictionFactor[];
  historicalAccuracy?: number; // If available from past predictions
  createdAt: Date;
}

export interface AIPredictionFactor {
  name: string;
  impact: number; // -100 to 100 (negative = negative impact)
  description: string;
  confidence: number; // 0-100
}

export interface AIAlert {
  id: string;
  type: 'opportunity' | 'warning' | 'critical';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedMetric: string;
  currentValue: number;
  expectedValue?: number;
  threshold: number;
  recommendations: string[];
  subIds?: string[];
  platforms?: string[];
  createdAt: Date;
  isRead: boolean;
  isDismissed: boolean;
}

export interface AIPerformanceInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'benchmark';
  title: string;
  description: string;
  insight: string;
  confidence: number; // 0-100
  dataRange: {
    from: Date;
    to: Date;
  };
  affectedMetrics: string[];
  visualizationData?: any; // Chart data if applicable
  createdAt: Date;
}

export interface AIBudgetOptimization {
  id: string;
  currentAllocation: AIBudgetAllocation[];
  recommendedAllocation: AIBudgetAllocation[];
  expectedImprovement: {
    roi: number;
    revenue: number;
    orders: number;
  };
  riskAssessment: 'low' | 'medium' | 'high';
  justification: string[];
  constraints: AIBudgetConstraint[];
  createdAt: Date;
}

export interface AIBudgetAllocation {
  subId: string;
  platform: string;
  currentBudget: number;
  recommendedBudget: number;
  expectedROI: number;
  confidence: number;
  reasoning: string;
}

export interface AIBudgetConstraint {
  type: 'min_budget' | 'max_budget' | 'platform_limit' | 'total_budget';
  value: number;
  description: string;
}

// AI Analysis Results

export interface AIAnalysisResult {
  id: string;
  analysisType: 'performance' | 'prediction' | 'optimization' | 'insights';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  recommendations: AIRecommendation[];
  predictions: AIPrediction[];
  alerts: AIAlert[];
  insights: AIPerformanceInsight[];
  budgetOptimization?: AIBudgetOptimization;
  metadata: {
    dataPointsAnalyzed: number;
    analysisStartTime: Date;
    analysisEndTime?: Date;
    modelVersion: string;
    confidence: number;
  };
  errors: string[];
}

// AI Configuration

export interface AIConfig {
  analysisSettings: {
    minDataPoints: number;
    confidenceThreshold: number;
    predictionTimeframes: number[]; // Days
    alertThresholds: {
      roi: { warning: number; critical: number };
      spend: { warning: number; critical: number };
      orders: { warning: number; critical: number };
    };
  };
  modelSettings: {
    enablePredictions: boolean;
    enableRecommendations: boolean;
    enableAlerts: boolean;
    enableBudgetOptimization: boolean;
    updateFrequency: number; // Hours
  };
  userPreferences: {
    preferredMetrics: string[];
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    autoApplyRecommendations: boolean;
    notificationSettings: {
      email: boolean;
      inApp: boolean;
      frequency: 'immediate' | 'daily' | 'weekly';
    };
  };
}

// AI Service Interfaces

export interface AIAnalysisService {
  analyzePerformance(data: AIAnalysisData): Promise<AIAnalysisResult>;
  generateRecommendations(data: AIAnalysisData): Promise<AIRecommendation[]>;
  predictMetrics(data: AIAnalysisData, timeframe: number): Promise<AIPrediction[]>;
  detectAnomalies(data: AIAnalysisData): Promise<AIAlert[]>;
  optimizeBudget(data: AIAnalysisData, constraints?: AIBudgetConstraint[]): Promise<AIBudgetOptimization>;
  getInsights(data: AIAnalysisData): Promise<AIPerformanceInsight[]>;
}

export interface AIDataProcessor {
  processRawData(
    shopeeOrders: any[],
    lazadaOrders: any[],
    facebookAds: any[],
    calculatedMetrics: CalculatedMetrics,
    dailyMetrics: DailyMetrics[]
  ): AIAnalysisData;
  validateData(data: AIAnalysisData): { isValid: boolean; errors: string[] };
  enrichData(data: AIAnalysisData): AIAnalysisData;
}

// Extended Metrics for AI Analysis

export interface AIEnhancedMetrics extends CalculatedMetrics {
  // Performance trends
  roiTrend: 'improving' | 'declining' | 'stable';
  revenueTrend: 'improving' | 'declining' | 'stable';
  ordersTrend: 'improving' | 'declining' | 'stable';
  
  // Efficiency metrics
  costPerOrder: number;
  revenuePerOrder: number;
  conversionRate: number;
  
  // Platform comparison
  platformPerformance: {
    shopee: { roi: number; orders: number; revenue: number };
    lazada: { roi: number; orders: number; revenue: number };
    facebook: { roi: number; orders: number; revenue: number };
  };
  
  // Sub ID performance
  topPerformingSubIds: Array<{
    subId: string;
    roi: number;
    orders: number;
    revenue: number;
    platform: string;
  }>;
  
  underPerformingSubIds: Array<{
    subId: string;
    roi: number;
    orders: number;
    revenue: number;
    platform: string;
  }>;
  
  // Time-based patterns
  bestPerformingDays: string[];
  worstPerformingDays: string[];
  seasonalPatterns: Array<{
    period: string;
    avgROI: number;
    avgOrders: number;
  }>;
  
  // Data quality indicators
  dataQuality: {
    completeness: number; // 0-100
    consistency: number; // 0-100
    freshness: number; // Days since last update
    reliability: number; // 0-100
  };
}

// User Feedback for AI Learning

export interface AIFeedback {
  id: string;
  recommendationId: string;
  userId?: string;
  feedbackType: 'thumbs_up' | 'thumbs_down' | 'implemented' | 'ignored';
  rating?: number; // 1-5 stars
  comment?: string;
  actualOutcome?: {
    roiChange: number;
    revenueChange: number;
    ordersChange: number;
  };
  createdAt: Date;
}

export interface AILearningData {
  feedbacks: AIFeedback[];
  recommendationAccuracy: {
    total: number;
    successful: number;
    failed: number;
    accuracy: number; // 0-100
  };
  modelPerformance: {
    predictionAccuracy: number;
    recommendationEffectiveness: number;
    userSatisfaction: number;
  };
}