// AI Analysis Hook
// Integrates AI analysis with existing data flow from useImportedData

import { useState, useEffect, useCallback } from 'react';
import { useImportedData } from '@/hooks/useImportedData';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { aiDataProcessor } from '@/services/aiDataProcessor';
import { aiConfigService } from '@/services/aiConfigService';
import {
  AIAnalysisResult,
  AIRecommendation,
  AIPrediction,
  AIAlert,
  AIPerformanceInsight,
  AIBudgetOptimization,
  AIAnalysisData
} from '@/types/ai';

interface AIAnalysisState {
  isAnalyzing: boolean;
  analysisResult: AIAnalysisResult | null;
  recommendations: AIRecommendation[];
  predictions: AIPrediction[];
  alerts: AIAlert[];
  insights: AIPerformanceInsight[];
  budgetOptimization: AIBudgetOptimization | null;
  error: string | null;
  lastAnalysisTime: Date | null;
}

export function useAIAnalysis() {
  const { importedData, calculatedMetrics, dailyMetrics, hasData } = useImportedData();
  
  const [aiState, setAIState] = useState<AIAnalysisState>(() => {
    // Load cached AI results from localStorage
    try {
      const cached = localStorage.getItem('ai_analysis_results');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        return {
          isAnalyzing: false,
          analysisResult: parsedCache.analysisResult || null,
          recommendations: parsedCache.recommendations || [],
          predictions: parsedCache.predictions || [],
          alerts: parsedCache.alerts || [],
          insights: parsedCache.insights || [],
          budgetOptimization: parsedCache.budgetOptimization || null,
          error: null,
          lastAnalysisTime: parsedCache.lastAnalysisTime ? new Date(parsedCache.lastAnalysisTime) : null
        };
      }
    } catch (error) {
      console.warn('Failed to load cached AI results:', error);
    }
    
    return {
      isAnalyzing: false,
      analysisResult: null,
      recommendations: [],
      predictions: [],
      alerts: [],
      insights: [],
      budgetOptimization: null,
      error: null,
      lastAnalysisTime: null
    };
  });

  // Auto-trigger analysis when data changes
  useEffect(() => {
    if (hasData && importedData && calculatedMetrics && dailyMetrics) {
      const shouldAutoAnalyze = aiConfigService.getConfig().modelSettings.enableRecommendations;
      const lastAnalysis = aiState.lastAnalysisTime;
      const updateFrequency = aiConfigService.getUpdateFrequency();
      
      // Check if we need to run analysis
      const needsAnalysis = !lastAnalysis || 
        (Date.now() - lastAnalysis.getTime()) > (updateFrequency * 60 * 60 * 1000);
      
      if (shouldAutoAnalyze && needsAnalysis && !aiState.isAnalyzing) {
        console.log('🤖 Auto-triggering AI analysis due to data changes');
        runAnalysis();
      }
    }
  }, [hasData, importedData, calculatedMetrics, dailyMetrics]);

  const runAnalysis = useCallback(async () => {
    if (!importedData || !calculatedMetrics || !dailyMetrics) {
      setAIState(prev => ({
        ...prev,
        error: 'No data available for AI analysis'
      }));
      return;
    }

    console.log('🤖 Starting AI analysis...');
    setAIState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null
    }));

    try {
      // Process raw data for AI analysis
      const aiData: AIAnalysisData = aiDataProcessor.processRawData(
        importedData.shopeeOrders,
        importedData.lazadaOrders,
        importedData.facebookAds,
        calculatedMetrics,
        dailyMetrics
      );

      // Validate data quality
      const validation = aiDataProcessor.validateData(aiData);
      if (!validation.isValid) {
        console.warn('AI Analysis validation warnings:', validation.errors);
        // Continue with analysis but log warnings
      }

      // Enrich data with additional insights
      const enrichedData = aiDataProcessor.enrichData(aiData);

      // Run AI analysis
      const analysisResult = await aiAnalysisService.analyzePerformance(enrichedData);

      // Update state with results
      const newState: AIAnalysisState = {
        isAnalyzing: false,
        analysisResult,
        recommendations: analysisResult.recommendations,
        predictions: analysisResult.predictions,
        alerts: analysisResult.alerts,
        insights: analysisResult.insights,
        budgetOptimization: analysisResult.budgetOptimization || null,
        error: null,
        lastAnalysisTime: new Date()
      };

      setAIState(newState);

      // Cache results to localStorage
      try {
        const cacheData = {
          analysisResult: newState.analysisResult,
          recommendations: newState.recommendations,
          predictions: newState.predictions,
          alerts: newState.alerts,
          insights: newState.insights,
          budgetOptimization: newState.budgetOptimization,
          lastAnalysisTime: newState.lastAnalysisTime
        };
        localStorage.setItem('ai_analysis_results', JSON.stringify(cacheData));
        console.log('✅ AI analysis results cached to localStorage');
      } catch (cacheError) {
        console.warn('Failed to cache AI results:', cacheError);
      }

      console.log('✅ AI analysis completed successfully:', {
        recommendations: analysisResult.recommendations.length,
        predictions: analysisResult.predictions.length,
        alerts: analysisResult.alerts.length,
        insights: analysisResult.insights.length,
        confidence: analysisResult.metadata.confidence
      });

    } catch (error) {
      console.error('❌ AI analysis failed:', error);
      setAIState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'AI analysis failed'
      }));
    }
  }, [importedData, calculatedMetrics, dailyMetrics]);

  const clearAnalysis = useCallback(() => {
    setAIState({
      isAnalyzing: false,
      analysisResult: null,
      recommendations: [],
      predictions: [],
      alerts: [],
      insights: [],
      budgetOptimization: null,
      error: null,
      lastAnalysisTime: null
    });

    // Clear cached results
    try {
      localStorage.removeItem('ai_analysis_results');
      console.log('🗑️ AI analysis results cleared');
    } catch (error) {
      console.warn('Failed to clear AI cache:', error);
    }
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAIState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, isDismissed: true } : alert
      )
    }));
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAIState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    }));
  }, []);

  // Filtered getters based on user preferences
  const getHighPriorityRecommendations = useCallback(() => {
    return aiState.recommendations.filter(rec => rec.priority === 'high');
  }, [aiState.recommendations]);

  const getUnreadAlerts = useCallback(() => {
    return aiState.alerts.filter(alert => !alert.isRead && !alert.isDismissed);
  }, [aiState.alerts]);

  const getCriticalAlerts = useCallback(() => {
    return aiState.alerts.filter(alert => alert.severity === 'high' && !alert.isDismissed);
  }, [aiState.alerts]);

  const getRecommendationsByType = useCallback((type: string) => {
    return aiState.recommendations.filter(rec => rec.type === type);
  }, [aiState.recommendations]);

  const getPredictionsByTimeframe = useCallback((timeframe: number) => {
    return aiState.predictions.filter(pred => pred.timeframe === timeframe);
  }, [aiState.predictions]);

  // Analysis status helpers
  const hasRecommendations = aiState.recommendations.length > 0;
  const hasPredictions = aiState.predictions.length > 0;
  const hasAlerts = aiState.alerts.length > 0;
  const hasInsights = aiState.insights.length > 0;
  const hasBudgetOptimization = aiState.budgetOptimization !== null;

  const analysisAge = aiState.lastAnalysisTime 
    ? Math.floor((Date.now() - aiState.lastAnalysisTime.getTime()) / (1000 * 60 * 60)) // Hours
    : null;

  const needsRefresh = analysisAge !== null && analysisAge > aiConfigService.getUpdateFrequency();

  return {
    // State
    isAnalyzing: aiState.isAnalyzing,
    analysisResult: aiState.analysisResult,
    recommendations: aiState.recommendations,
    predictions: aiState.predictions,
    alerts: aiState.alerts,
    insights: aiState.insights,
    budgetOptimization: aiState.budgetOptimization,
    error: aiState.error,
    lastAnalysisTime: aiState.lastAnalysisTime,

    // Actions
    runAnalysis,
    clearAnalysis,
    dismissAlert,
    markAlertAsRead,

    // Filtered getters
    getHighPriorityRecommendations,
    getUnreadAlerts,
    getCriticalAlerts,
    getRecommendationsByType,
    getPredictionsByTimeframe,

    // Status helpers
    hasRecommendations,
    hasPredictions,
    hasAlerts,
    hasInsights,
    hasBudgetOptimization,
    analysisAge,
    needsRefresh,

    // Data availability
    canAnalyze: hasData && !aiState.isAnalyzing,
    dataQuality: aiState.analysisResult?.metadata.confidence || 0
  };
}